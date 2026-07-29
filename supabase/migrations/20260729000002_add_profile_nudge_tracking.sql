-- Lets a daily job nudge accounts that signed up but haven't added any
-- wishlist items yet. Purely additive: two new columns on profiles, plus
-- the two extensions needed to schedule and fire the reminder job from
-- inside Postgres (pg_cron) via an HTTP call (pg_net) to the app's own
-- route handler, which does the actual "who's eligible + send email" work.
alter table public.profiles
  add column nudge_enabled boolean not null default true,
  add column last_nudge_sent_at timestamptz;

create extension if not exists pg_cron;
create extension if not exists pg_net;
