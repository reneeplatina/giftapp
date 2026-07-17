-- Extensions and shared helper functions used by every table migration.

create extension if not exists pgcrypto;

-- Generic "touch updated_at" trigger, reused by every table that has one.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
