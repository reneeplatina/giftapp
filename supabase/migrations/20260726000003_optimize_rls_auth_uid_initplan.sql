-- Performance fix: wrap every auth.uid() call in RLS policies as
-- (select auth.uid()) so Postgres evaluates it once per query instead of
-- once per row (the auth_rls_initplan advisor warning). No access-control
-- semantics change — every policy keeps the exact same USING/WITH CHECK
-- condition, just with auth.uid() made a stable subselect.

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (id = (select auth.uid()));

drop policy if exists "profiles_manager_select" on public.profiles;
create policy "profiles_manager_select" on public.profiles
  for select using (managed_by_profile_id = (select auth.uid()));

drop policy if exists "profiles_manager_update" on public.profiles;
create policy "profiles_manager_update" on public.profiles
  for update using (managed_by_profile_id = (select auth.uid()))
  with check (managed_by_profile_id = (select auth.uid()));

drop policy if exists "profiles_manager_delete" on public.profiles;
create policy "profiles_manager_delete" on public.profiles
  for delete using (managed_by_profile_id = (select auth.uid()));

-- profile_sections
drop policy if exists "profile_sections_all_own" on public.profile_sections;
create policy "profile_sections_all_own" on public.profile_sections
  for all using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists "profile_sections_all_managed" on public.profile_sections;
create policy "profile_sections_all_managed" on public.profile_sections
  for all using (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  )
  with check (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  );

-- wishlist_items
drop policy if exists "wishlist_items_all_own" on public.wishlist_items;
create policy "wishlist_items_all_own" on public.wishlist_items
  for all using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists "wishlist_items_all_managed" on public.wishlist_items;
create policy "wishlist_items_all_managed" on public.wishlist_items
  for all using (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  )
  with check (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  );

-- profile_images
drop policy if exists "profile_images_all_own" on public.profile_images;
create policy "profile_images_all_own" on public.profile_images
  for all using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists "profile_images_all_managed" on public.profile_images;
create policy "profile_images_all_managed" on public.profile_images
  for all using (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  )
  with check (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  );

-- ai_interview_sessions
drop policy if exists "ai_interview_sessions_all_own" on public.ai_interview_sessions;
create policy "ai_interview_sessions_all_own" on public.ai_interview_sessions
  for all using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists "ai_interview_sessions_all_managed" on public.ai_interview_sessions;
create policy "ai_interview_sessions_all_managed" on public.ai_interview_sessions
  for all using (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  )
  with check (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  );

-- ai_interview_messages
drop policy if exists "ai_interview_messages_all_own" on public.ai_interview_messages;
create policy "ai_interview_messages_all_own" on public.ai_interview_messages
  for all using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

drop policy if exists "ai_interview_messages_all_managed" on public.ai_interview_messages;
create policy "ai_interview_messages_all_managed" on public.ai_interview_messages
  for all using (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  )
  with check (
    profile_id in (
      select profiles.id from public.profiles
      where profiles.managed_by_profile_id = (select auth.uid())
    )
  );

-- ai_suggestions
drop policy if exists "ai_suggestions_all_own" on public.ai_suggestions;
create policy "ai_suggestions_all_own" on public.ai_suggestions
  for all using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- gift_exchange_requests
drop policy if exists "gift_exchange_requests_source_manages" on public.gift_exchange_requests;
create policy "gift_exchange_requests_source_manages" on public.gift_exchange_requests
  for all using (source_profile_id = (select auth.uid()))
  with check (source_profile_id = (select auth.uid()));

drop policy if exists "gift_exchange_requests_referred_can_view" on public.gift_exchange_requests;
create policy "gift_exchange_requests_referred_can_view" on public.gift_exchange_requests
  for select using (referred_user_id = (select auth.uid()));

-- profile_reports
drop policy if exists "profile_reports_insert_authenticated" on public.profile_reports;
create policy "profile_reports_insert_authenticated" on public.profile_reports
  for insert with check (
    reporter_user_id = (select auth.uid()) or reporter_user_id is null
  );
