-- gift_exchange_requests: "share your profile, ask them to send theirs
-- back" flow. exchange_token is the bearer credential for the flow — it
-- is random and unrelated to any user id, and is the only way an
-- anonymous visitor can resolve or act on a request (see the functions
-- migration). No contact info (phone/email) is ever stored here.

create type public.exchange_status as enum ('created', 'started', 'completed', 'cancelled');

create table public.gift_exchange_requests (
  id uuid primary key default gen_random_uuid(),
  source_profile_id uuid not null references public.profiles (id) on delete cascade,
  recipient_label text,
  exchange_token text not null default encode(gen_random_bytes(24), 'hex'),
  referred_user_id uuid references auth.users (id) on delete set null,
  referred_profile_id uuid references public.profiles (id) on delete set null,
  status public.exchange_status not null default 'created',
  share_count integer not null default 0,
  last_shared_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint gift_exchange_requests_share_count_non_negative check (share_count >= 0),
  constraint gift_exchange_requests_token_format check (exchange_token ~ '^[a-f0-9]{48}$')
);

create unique index gift_exchange_requests_token_key on public.gift_exchange_requests (exchange_token);
create index gift_exchange_requests_source_idx on public.gift_exchange_requests (source_profile_id);
create index gift_exchange_requests_referred_user_idx on public.gift_exchange_requests (referred_user_id);

create trigger gift_exchange_requests_set_updated_at
  before update on public.gift_exchange_requests
  for each row execute function public.set_updated_at();

alter table public.gift_exchange_requests enable row level security;

-- The profile that created the request (the "source") can fully manage
-- it: create it, re-share it, cancel it, delete it.
create policy gift_exchange_requests_source_manages
  on public.gift_exchange_requests for all
  to authenticated
  using (source_profile_id = auth.uid())
  with check (source_profile_id = auth.uid());

-- Once a request has been claimed (referred_user_id set), the referred
-- user can see it via ordinary table access — e.g. to show "you're
-- completing an exchange from Renee" in their own dashboard later.
-- Claiming itself does NOT happen through this policy: see
-- claim_exchange_request() in the next migration for why a table-level
-- UPDATE policy here would be unsafe.
create policy gift_exchange_requests_referred_can_view
  on public.gift_exchange_requests for select
  to authenticated
  using (referred_user_id = auth.uid());

-- No anon policy at all. Anonymous visitors can only resolve a token's
-- public-safe summary through resolve_exchange_token().
grant select, insert, update, delete on public.gift_exchange_requests to authenticated;
