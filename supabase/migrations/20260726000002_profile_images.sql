-- profile_images: a "My Images" gallery — general inspiration/reference
-- photos for the profile owner (or their gift ideas), separate from the
-- single avatar and from any one wishlist item. Same ownership pattern
-- as wishlist_items: owner-or-manager can fully manage; public reads
-- only ever see rows/paths the app itself chooses to reveal (is_public),
-- the same trust model already used for wishlist item images.

create table public.profile_images (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  image_path text not null,
  caption text not null default '',
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint profile_images_caption_length check (char_length(caption) <= 140)
);

create index profile_images_profile_id_idx on public.profile_images (profile_id);

alter table public.profile_images enable row level security;

create policy profile_images_all_own
  on public.profile_images for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy profile_images_all_managed
  on public.profile_images for all
  to authenticated
  using (
    profile_id in (
      select id from public.profiles where managed_by_profile_id = auth.uid()
    )
  )
  with check (
    profile_id in (
      select id from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.profile_images to authenticated;

-- Storage: private bucket, path convention {profile_id}/{filename} —
-- same shape as the avatars/wishlist-images buckets from
-- supabase/migrations/20260717000011_storage_buckets.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-images', 'profile-images', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy profile_images_owner_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy profile_images_owner_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy profile_images_owner_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy profile_images_read
  on storage.objects for select
  to authenticated, anon
  using (
    bucket_id = 'profile-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_profile_published((storage.foldername(name))[1]::uuid)
    )
  );

create policy profile_images_manager_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

create policy profile_images_manager_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

create policy profile_images_manager_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

-- get_public_profile() now also returns published profile_images.
create or replace function public.get_public_profile(profile_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_result jsonb;
begin
  select p.* into v_profile
    from public.profiles p
   where p.slug = lower(profile_slug)
     and p.status = 'published';

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'slug', v_profile.slug,
    'displayName', v_profile.display_name,
    'avatarPath', v_profile.avatar_path,
    'introduction', v_profile.introduction,
    'giftStyleSummary', v_profile.gift_style_summary,
    'theme', v_profile.default_theme,
    'sections', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'sectionKey', s.section_key,
          'data', s.data
        )
        order by s.sort_order
      )
      from public.profile_sections s
      where s.profile_id = v_profile.id
        and s.is_public
    ), '[]'::jsonb),
    'wishlistItems', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', w.id,
          'name', w.name,
          'description', w.description,
          'imagePath', w.image_path,
          'productUrl', w.product_url,
          'estimatedPrice', w.estimated_price,
          'budgetLevel', w.budget_level,
          'category', w.category,
          'priority', w.priority,
          'preferredColor', w.preferred_color,
          'preferredSize', w.preferred_size,
          'acceptableAlternatives', w.acceptable_alternatives,
          'acceptsUsed', w.accepts_used,
          'acceptsRefurbished', w.accepts_refurbished,
          'acceptsContributions', w.accepts_contributions,
          'itemType', w.item_type
        )
        order by w.sort_order
      )
      from public.wishlist_items w
      where w.profile_id = v_profile.id
        and w.is_public
        and not w.is_archived
    ), '[]'::jsonb),
    'images', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', i.id,
          'imagePath', i.image_path,
          'caption', i.caption
        )
        order by i.sort_order, i.created_at
      )
      from public.profile_images i
      where i.profile_id = v_profile.id
        and i.is_public
    ), '[]'::jsonb),
    'managedProfiles', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'slug', m.slug,
          'displayName', m.display_name,
          'avatarPath', m.avatar_path
        )
        order by m.created_at
      )
      from public.profiles m
      where m.managed_by_profile_id = v_profile.id
        and m.status = 'published'
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.get_public_profile(text) from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;
