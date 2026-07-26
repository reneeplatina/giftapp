-- profile_reports: abuse/moderation reports against a public profile.
-- Anyone (including anonymous visitors) may file a report, but no one
-- except a future admin/service-role tool can read the table back — this
-- protects reporters' anonymity and keeps a reported profile's owner
-- from seeing who reported them.

create type public.profile_report_status as enum ('open', 'reviewed', 'resolved');

create table public.profile_reports (
  id uuid primary key default gen_random_uuid(),
  reported_profile_id uuid not null references public.profiles (id) on delete cascade,
  reporter_user_id uuid references auth.users (id) on delete set null,
  reason text not null,
  details text,
  status public.profile_report_status not null default 'open',
  created_at timestamptz not null default now(),

  constraint profile_reports_reason_not_blank check (char_length(btrim(reason)) > 0)
);

create index profile_reports_reported_profile_idx on public.profile_reports (reported_profile_id);

alter table public.profile_reports enable row level security;

-- Insert-only for both anon and authenticated. reporter_user_id must
-- match the caller's own auth.uid() (or be null for an anonymous
-- report) — nobody can file a report "as" someone else.
create policy profile_reports_insert_authenticated
  on public.profile_reports for insert
  to authenticated
  with check (reporter_user_id = auth.uid() or reporter_user_id is null);

create policy profile_reports_insert_anon
  on public.profile_reports for insert
  to anon
  with check (reporter_user_id is null);

grant insert on public.profile_reports to authenticated, anon;
-- No select/update/delete grants for anon or authenticated: reports are
-- reviewed only through trusted server-side/service-role tooling.
