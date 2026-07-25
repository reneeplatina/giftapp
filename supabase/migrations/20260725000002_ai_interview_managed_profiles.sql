-- Now that the AI Gift Builder can target a managed profile (see
-- src/lib/interview/actions.ts), it needs the same "manager can act on
-- profiles they manage" coverage already granted on profile_sections and
-- wishlist_items. Additive only — the existing *_all_own policies are
-- untouched, and Postgres combines multiple permissive policies for the
-- same command with OR.

create policy ai_interview_sessions_all_managed
  on public.ai_interview_sessions for all
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

create policy ai_interview_messages_all_managed
  on public.ai_interview_messages for all
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
