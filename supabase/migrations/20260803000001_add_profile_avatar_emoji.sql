-- Lets a profile use a chosen emoji (on a colored background) as its
-- avatar instead of an uploaded photo. Both nullable and independent of
-- avatar_path — the app enforces "only one active at a time" by clearing
-- whichever wasn't just chosen, not a DB constraint, since either could
-- validly be null (no avatar picked yet at all).

alter table public.profiles
  add column avatar_emoji text,
  add column avatar_emoji_bg text;

alter table public.profiles
  add constraint profiles_avatar_emoji_length check (
    avatar_emoji is null or char_length(avatar_emoji) <= 8
  ),
  add constraint profiles_avatar_emoji_bg_format check (
    avatar_emoji_bg is null or avatar_emoji_bg ~ '^#[0-9a-fA-F]{6}$'
  );
