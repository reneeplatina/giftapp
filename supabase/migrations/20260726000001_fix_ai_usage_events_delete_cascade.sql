-- ai_usage_events had `user_id references auth.users(id) on delete set
-- null`, but also a check constraint requiring user_id OR
-- anonymous_session_hash to be present. For a signed-in user's usage
-- row (anonymous_session_hash is always null there), deleting the
-- account nulled user_id and left both null, violating the check and
-- aborting the entire account-deletion transaction. This table only
-- backs short-lived daily rate limiting (docs/AI_SAFETY.md) — there's
-- no reason to retain a deleted account's usage rows, so cascade is the
-- correct behavior, not set null.

alter table public.ai_usage_events
  drop constraint ai_usage_events_user_id_fkey;

alter table public.ai_usage_events
  add constraint ai_usage_events_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;
