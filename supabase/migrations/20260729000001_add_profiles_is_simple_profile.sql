-- Marks a profile as "simple mode" (e.g. a kids profile): the editor
-- shows only basic info + wishlist, skipping the full set of interest/
-- style categories. Purely additive, defaults false for all existing rows.
alter table public.profiles
  add column is_simple_profile boolean not null default false;
