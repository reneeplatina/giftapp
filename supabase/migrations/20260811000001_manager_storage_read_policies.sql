-- Each storage bucket already lets someone insert/update/delete files
-- belonging to a profile they manage (a child's, say), but the only
-- SELECT policy is "the file is mine, or that profile is published".
-- A managed profile sits in 'draft' until it's shared, so a parent
-- could upload a photo for their child and then never see it again —
-- createSignedUrl needs SELECT, so it just returned nothing and the UI
-- silently fell back to the placeholder.
--
-- These add the missing read half, mirroring the manager_insert
-- policies exactly. Nothing is exposed to anyone else: only the
-- managing account gains access, and only to profiles it already
-- controls. No existing policy is changed or removed.

create policy "wishlist_images_manager_read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'wishlist-images'
    and (storage.foldername(name))[1] in (
      select p.id::text from public.profiles p
      where p.managed_by_profile_id = auth.uid()
    )
  );

create policy "avatars_manager_read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] in (
      select p.id::text from public.profiles p
      where p.managed_by_profile_id = auth.uid()
    )
  );

create policy "profile_images_manager_read"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] in (
      select p.id::text from public.profiles p
      where p.managed_by_profile_id = auth.uid()
    )
  );
