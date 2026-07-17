-- ai_suggestions: AI-generated gift ideas surfaced to the profile owner.

create type public.ai_suggestion_status as enum ('pending', 'accepted', 'dismissed');

create table public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  suggestion_type text not null,
  content jsonb not null,
  status public.ai_suggestion_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ai_suggestions_profile_id_idx on public.ai_suggestions (profile_id);

create trigger ai_suggestions_set_updated_at
  before update on public.ai_suggestions
  for each row execute function public.set_updated_at();

alter table public.ai_suggestions enable row level security;

create policy ai_suggestions_all_own
  on public.ai_suggestions for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

grant select, insert, update, delete on public.ai_suggestions to authenticated;
