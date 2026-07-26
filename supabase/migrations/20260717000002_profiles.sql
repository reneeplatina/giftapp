-- profiles: one row per user account, 1:1 with auth.users.
-- id is both the primary key and a foreign key to auth.users(id), so for
-- every child table "profile_id = auth.uid()" IS the ownership check —
-- no joins needed anywhere in this schema.

create type public.profile_status as enum ('draft', 'published', 'hidden');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null,
  display_name text not null,
  avatar_path text,
  introduction text not null default '',
  gift_style_summary text not null default '',
  birthday date,
  default_theme text not null default 'general',
  status public.profile_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_slug_format check (
    slug = lower(slug)
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(slug) between 3 and 40
  ),

  -- Route names and other words that would collide with the app's own
  -- paths or be confusing/impersonation-prone as a profile link.
  constraint profiles_slug_not_reserved check (
    slug <> all (array[
      'admin', 'api', 'app', 'auth', 'dashboard', 'login', 'logout',
      'signup', 'signin', 'sign-up', 'sign-in', 'forgot-password',
      'settings', 'help', 'support', 'about', 'contact', 'terms',
      'privacy', 'pricing', 'billing', 'blog', 'docs', 'static',
      'public', 'assets', 'u', 'profile', 'profiles', 'wishlist',
      'themes', 'preview', 'null', 'undefined', 'www', 'root'
    ])
  ),

  constraint profiles_default_theme_allowed check (
    default_theme in (
      'general', 'birthday', 'christmas', 'anniversary', 'graduation',
      'valentines', 'mothers_day', 'fathers_day', 'wedding',
      'baby_shower', 'housewarming'
    )
  ),

  constraint profiles_display_name_not_blank check (
    char_length(btrim(display_name)) > 0
  )
);

create unique index profiles_slug_key on public.profiles (slug);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Owners can fully manage their own profile row, regardless of status.
-- No policy exists for anon or for other authenticated users, so a
-- profile row (including its draft/hidden content) is invisible to
-- everyone except its owner via direct table access. Public reads only
-- ever go through the get_public_profile() function (see a later
-- migration), which is intentionally narrower than "select * where
-- status = 'published'" — it hides the id column (== the owner's auth
-- user id) and every other non-public-facing field.
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_delete_own
  on public.profiles for delete
  to authenticated
  using (id = auth.uid());

grant select, insert, update, delete on public.profiles to authenticated;
