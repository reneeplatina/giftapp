-- profile_sections: one row per profile per content section. section_key
-- mirrors the section keys already used by the Phase 1 mock-data UI
-- (src/types/profile.ts) so a future Phase 3 can map 1:1 onto this table.

create table public.profile_sections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  section_key text not null,
  data jsonb not null default '[]'::jsonb,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profile_sections_key_allowed check (
    section_key in (
      'favorite_colors', 'interests', 'sizes', 'food_and_drinks',
      'favorite_stores', 'tech_and_gaming', 'home_and_lifestyle',
      'creativity', 'fitness_and_wellness', 'experiences',
      'digital_gifts', 'things_to_avoid'
    )
  ),

  constraint profile_sections_unique_per_profile unique (profile_id, section_key)
);

create index profile_sections_profile_id_idx on public.profile_sections (profile_id);

create trigger profile_sections_set_updated_at
  before update on public.profile_sections
  for each row execute function public.set_updated_at();

alter table public.profile_sections enable row level security;

create policy profile_sections_all_own
  on public.profile_sections for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

grant select, insert, update, delete on public.profile_sections to authenticated;
