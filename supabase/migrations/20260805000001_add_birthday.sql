-- profiles.birthday has existed since the original schema but was never
-- wired up to any application code. This adds tracking for the
-- referral-based birthday reminder cron job, mirroring the existing
-- wishlist-nudge tracking column. Purely additive.
alter table public.profiles
  add column last_birthday_reminder_sent_at timestamptz;
