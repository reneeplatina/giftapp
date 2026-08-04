-- Adds "christmas" as an eleventh theme option, alongside the plain
-- color picker and rainbow — purely additive, no existing rows change.

alter table public.profiles
  drop constraint profiles_default_theme_allowed;

alter table public.profiles
  add constraint profiles_default_theme_allowed check (
    default_theme in (
      'general', 'rose', 'blush', 'amber', 'sage', 'teal', 'sky',
      'lavender', 'stone', 'rainbow', 'christmas'
    )
  );
