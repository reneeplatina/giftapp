-- ai_interview_sessions / ai_interview_messages: state for the guided AI
-- profile-building conversation (feature not built until a later phase).

create type public.ai_interview_status as enum ('in_progress', 'completed', 'abandoned');
create type public.ai_message_role as enum ('user', 'assistant');

create table public.ai_interview_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.ai_interview_status not null default 'in_progress',
  current_topic text,
  completion_percentage smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,

  constraint ai_interview_sessions_completion_range check (
    completion_percentage between 0 and 100
  )
);

create index ai_interview_sessions_profile_id_idx on public.ai_interview_sessions (profile_id);

create trigger ai_interview_sessions_set_updated_at
  before update on public.ai_interview_sessions
  for each row execute function public.set_updated_at();

create table public.ai_interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_interview_sessions (id) on delete cascade,
  -- Denormalized alongside session_id so RLS can check ownership directly
  -- (profile_id = auth.uid()) without a join back through the session.
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.ai_message_role not null,
  content text not null,
  structured_updates jsonb,
  created_at timestamptz not null default now(),

  constraint ai_interview_messages_content_not_blank check (
    char_length(btrim(content)) > 0
  )
);

create index ai_interview_messages_session_id_idx on public.ai_interview_messages (session_id);
create index ai_interview_messages_profile_id_idx on public.ai_interview_messages (profile_id);

-- Keep the denormalized profile_id honest: it must always match the
-- profile_id of the session it belongs to.
create or replace function public.check_message_profile_matches_session()
returns trigger
language plpgsql
as $$
begin
  if new.profile_id is distinct from (
    select s.profile_id from public.ai_interview_sessions s where s.id = new.session_id
  ) then
    raise exception 'ai_interview_messages.profile_id must match the session''s profile_id';
  end if;
  return new;
end;
$$;

create trigger ai_interview_messages_profile_check
  before insert or update on public.ai_interview_messages
  for each row execute function public.check_message_profile_matches_session();

alter table public.ai_interview_sessions enable row level security;
alter table public.ai_interview_messages enable row level security;

create policy ai_interview_sessions_all_own
  on public.ai_interview_sessions for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy ai_interview_messages_all_own
  on public.ai_interview_messages for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

grant select, insert, update, delete on public.ai_interview_sessions to authenticated;
grant select, insert, update, delete on public.ai_interview_messages to authenticated;
