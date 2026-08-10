-- feedback: free-text feedback submitted from the "Feedback" sidebar
-- item. Written directly by the submitting user (RLS-scoped insert,
-- tied to their own auth.uid()); read back only by the app owner's
-- admin page via the service-role client, which bypasses RLS — so
-- there is deliberately no select policy for anon/authenticated here.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),

  constraint feedback_message_length check (
    char_length(message) between 1 and 2000
  )
);

create index feedback_profile_id_idx on public.feedback (profile_id);
create index feedback_created_at_idx on public.feedback (created_at);

alter table public.feedback enable row level security;

create policy "Users can submit their own feedback"
  on public.feedback
  for insert
  to authenticated
  with check (profile_id = auth.uid());
