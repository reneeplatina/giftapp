-- Storage: profile avatars and wishlist item images. Both buckets are
-- private at the bucket level — read access is granted per-object via
-- policy, not by making the bucket public, so a draft/hidden profile's
-- images stay inaccessible even if someone has the exact URL.
--
-- Path convention (enforced by policy, not by a DB constraint):
--   avatars/{profile_id}/{filename}
--   wishlist-images/{profile_id}/{item_id}/{filename}
-- profile_id is always the first path segment, and — because
-- profiles.id == the owning user's auth.uid() — that's also exactly
-- what an owner-write policy needs to check.
--
-- Note: storage.objects already has RLS enabled by Supabase's own
-- platform setup (it's owned by an internal storage role, not this
-- migration role), so unlike our own tables we don't (and can't) issue
-- our own ENABLE ROW LEVEL SECURITY for it here — doing so fails with
-- "must be owner of table objects" on a real Supabase project.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('wishlist-images', 'wishlist-images', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- Avatars ---------------------------------------------------------------

create policy avatars_owner_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy avatars_owner_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_read
  on storage.objects for select
  to authenticated, anon
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_profile_published((storage.foldername(name))[1]::uuid)
    )
  );

-- Wishlist images ---------------------------------------------------------

create policy wishlist_images_owner_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wishlist-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy wishlist_images_owner_update
  on storage.objects for update
  to authenticated
  using (bucket_id = 'wishlist-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'wishlist-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy wishlist_images_owner_delete
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'wishlist-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy wishlist_images_read
  on storage.objects for select
  to authenticated, anon
  using (
    bucket_id = 'wishlist-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_profile_published((storage.foldername(name))[1]::uuid)
    )
  );
