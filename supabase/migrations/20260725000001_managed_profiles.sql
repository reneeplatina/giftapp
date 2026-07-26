-- Managed profiles: lets a signed-in user create and control a second
-- profile on someone else's behalf (a child, a grandparent — anyone who
-- wants a gift profile but won't be creating their own account).
--
-- A managed profile is still a completely ordinary row in public.profiles
-- with its own row in auth.users (that FK is unchanged and still
-- enforced) — the auth.users row is just a synthetic one nobody ever
-- signs in as (no usable email/password), created purely so the existing
-- profiles.id -> auth.users.id constraint continues to hold without any
-- change to it. What makes the profile "managed" is managed_by_profile_id
-- pointing at the real owner's profile id. Every additive policy below
-- grants the *manager* (auth.uid() = managed_by_profile_id) the same
-- access their own auth.uid() already has over their own rows — nothing
-- existing is altered or dropped, so a normal (unmanaged) profile's
-- behavior is completely unchanged.

alter table public.profiles
  add column managed_by_profile_id uuid references public.profiles (id) on delete cascade;

alter table public.profiles
  add constraint profiles_not_self_managed check (
    managed_by_profile_id is null or managed_by_profile_id <> id
  );

create index profiles_managed_by_profile_id_idx
  on public.profiles (managed_by_profile_id)
  where managed_by_profile_id is not null;

-- Caps management at a single level: a profile that is itself managed
-- can never become someone else's manager. Without this, a chain (A
-- manages B, B "manages" C) would let a manager's access silently extend
-- to profiles they were never granted, and every policy below would need
-- a recursive query instead of a flat equality check.
create or replace function public.prevent_managed_profile_chaining()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_manager_is_itself_managed boolean;
begin
  if new.managed_by_profile_id is null then
    return new;
  end if;

  select (managed_by_profile_id is not null) into v_manager_is_itself_managed
    from public.profiles
   where id = new.managed_by_profile_id;

  if v_manager_is_itself_managed then
    raise exception 'A managed profile cannot manage another profile';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_managed_chaining
  before insert or update of managed_by_profile_id on public.profiles
  for each row execute function public.prevent_managed_profile_chaining();

-- profiles: let a manager read/update/delete the profiles they manage,
-- exactly as an owner already can for their own row. INSERT is
-- deliberately not extended here — creating a managed profile also
-- requires creating its synthetic auth.users row first, which only the
-- service role can do, so that insert always runs as service role
-- (bypassing RLS entirely) rather than through a client-facing policy.
create policy profiles_manager_select
  on public.profiles for select
  to authenticated
  using (managed_by_profile_id = auth.uid());

create policy profiles_manager_update
  on public.profiles for update
  to authenticated
  using (managed_by_profile_id = auth.uid())
  with check (managed_by_profile_id = auth.uid());

create policy profiles_manager_delete
  on public.profiles for delete
  to authenticated
  using (managed_by_profile_id = auth.uid());

-- profile_sections / wishlist_items: same "for all" shape as the
-- existing *_all_own policies, just keyed off the managed relationship
-- instead of direct ownership. Postgres combines multiple permissive
-- policies for the same command with OR, so this purely adds coverage.
create policy profile_sections_all_managed
  on public.profile_sections for all
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

create policy wishlist_items_all_managed
  on public.wishlist_items for all
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

-- Storage: same pattern as the existing *_owner_* policies, but checking
-- whether the folder's profile_id (first path segment) is managed by the
-- caller rather than owned outright.
create policy avatars_manager_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

create policy avatars_manager_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

create policy avatars_manager_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

create policy wishlist_images_manager_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wishlist-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

create policy wishlist_images_manager_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'wishlist-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'wishlist-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

create policy wishlist_images_manager_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'wishlist-images'
    and (storage.foldername(name))[1] in (
      select id::text from public.profiles where managed_by_profile_id = auth.uid()
    )
  );

-- Public profile pages list the published, managed profiles a profile
-- manages (e.g. a parent's page linking out to a child's), so visitors
-- browsing the manager's page can find them.
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
