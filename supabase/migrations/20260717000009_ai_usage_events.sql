-- ai_usage_events: append-only log backing AI_DAILY_USER_LIMIT /
-- AI_DAILY_GUEST_LIMIT (docs/AI_SAFETY.md). Written only by trusted
-- server-side code using the service-role key, which bypasses RLS by
-- design — so RLS here exists purely as a hard backstop with no client
-- policies at all: neither anon nor authenticated can read or write
-- this table directly.

create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  anonymous_session_hash text,
  feature_name text not null,
  created_at timestamptz not null default now(),

  constraint ai_usage_events_subject_present check (
    user_id is not null or anonymous_session_hash is not null
  )
);

create index ai_usage_events_user_id_idx on public.ai_usage_events (user_id);
create index ai_usage_events_created_at_idx on public.ai_usage_events (created_at);

alter table public.ai_usage_events enable row level security;

-- Intentionally no policies and no grants for anon/authenticated: only
-- the service role (which bypasses RLS) can read or write this table.
