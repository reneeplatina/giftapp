-- Extensions and shared helper functions used by every table migration.

create extension if not exists pgcrypto;

-- Generic "touch updated_at" trigger, reused by every table that has one.
-- search_path is pinned so an unqualified identifier can't be hijacked
-- by another role's same-named object earlier in resolution order.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
