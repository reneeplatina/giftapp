-- Wishlist items can now get an auto-attached photo from Unsplash when
-- saved with no photo of their own. Unsplash's API terms require crediting
-- the photographer, so we store the attribution alongside the item rather
-- than just the image itself. Both columns are nullable and unused for
-- manually-uploaded photos.

alter table public.wishlist_items
  add column image_attribution_name text,
  add column image_attribution_url text;
