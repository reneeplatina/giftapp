-- wishlist_items: exact items, general ideas, and dream gifts.

create type public.wishlist_priority as enum ('nice_to_have', 'would_love', 'dream_gift');
create type public.wishlist_item_type as enum ('exact_item', 'general_idea', 'dream_gift');
create type public.wishlist_budget_level as enum ('under_25', '25_to_75', '75_to_200', 'over_200');

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text not null default '',
  image_path text,
  product_url text,
  estimated_price numeric(10, 2),
  budget_level public.wishlist_budget_level,
  category text,
  priority public.wishlist_priority not null default 'would_love',
  preferred_color text,
  preferred_size text,
  acceptable_alternatives text,
  accepts_used boolean not null default false,
  accepts_refurbished boolean not null default false,
  accepts_contributions boolean not null default false,
  item_type public.wishlist_item_type not null default 'exact_item',
  is_public boolean not null default true,
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint wishlist_items_name_not_blank check (char_length(btrim(name)) > 0),
  constraint wishlist_items_price_non_negative check (
    estimated_price is null or estimated_price >= 0
  ),
  -- User-supplied links only (never AI-generated, per docs/AI_SAFETY.md);
  -- require https so a stored value can't be a javascript:/data: URL.
  constraint wishlist_items_product_url_https check (
    product_url is null or product_url ~* '^https://'
  )
);

create index wishlist_items_profile_id_idx on public.wishlist_items (profile_id);
create index wishlist_items_public_visible_idx
  on public.wishlist_items (profile_id)
  where is_public and not is_archived;

create trigger wishlist_items_set_updated_at
  before update on public.wishlist_items
  for each row execute function public.set_updated_at();

alter table public.wishlist_items enable row level security;

create policy wishlist_items_all_own
  on public.wishlist_items for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

grant select, insert, update, delete on public.wishlist_items to authenticated;
