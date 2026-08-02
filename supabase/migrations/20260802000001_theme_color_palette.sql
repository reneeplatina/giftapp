-- Replace the holiday/event theme presets with a plain color picker (+ one
-- rainbow option). Existing profiles on a removed key are remapped to the
-- closest new color before the CHECK constraint is swapped, so no row is
-- ever left holding a now-invalid value.

alter table public.profiles
  drop constraint profiles_default_theme_allowed;

update public.profiles
set default_theme = case default_theme
  when 'birthday' then 'blush'
  when 'christmas' then 'sage'
  when 'anniversary' then 'rose'
  when 'graduation' then 'sky'
  when 'valentines' then 'rose'
  when 'mothers_day' then 'lavender'
  when 'fathers_day' then 'teal'
  when 'wedding' then 'stone'
  when 'baby_shower' then 'sky'
  when 'housewarming' then 'amber'
  else default_theme
end
where default_theme not in ('general');

alter table public.profiles
  add constraint profiles_default_theme_allowed check (
    default_theme in (
      'general', 'rose', 'blush', 'amber', 'sage', 'teal', 'sky',
      'lavender', 'stone', 'rainbow'
    )
  );
