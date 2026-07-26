-- Local development seed data only. This file is applied by
-- `supabase db reset` against your local Supabase stack — it is never
-- run against a real/remote database. Content mirrors the Phase 1
-- mock data (src/lib/mock/profile.ts) so the two stay easy to compare.

-- A minimal auth.users row so profiles.id (FK to auth.users) is valid.
-- Password is the well-known local-dev value "password" — never used
-- outside this seed.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'renee@example.com',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
)
on conflict (id) do nothing;

insert into public.profiles (
  id, slug, display_name, introduction, gift_style_summary, default_theme, status
) values (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'renee',
  'Renee',
  'Shopping for me? Here are some things I genuinely love, use, and would be excited to receive.',
  'Practical, tech-forward, and a little bit cozy — I love things I''ll actually use every day.',
  'general',
  'published'
)
on conflict (id) do nothing;

insert into public.profile_sections (profile_id, section_key, data, is_public, sort_order)
values
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'favorite_colors',
   '["Black", "White", "Pink"]', true, 1),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'interests',
   '["Cozy gaming", "Technology", "Artificial intelligence tools", "Creative work", "Web design", "Home and office upgrades", "Fitness and wellness", "Helpful household tools"]',
   true, 2),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'sizes',
   '{"shirt": "M", "pants": "8", "shoe": "8.5", "dress": "6", "ringSize": "6.5"}',
   true, 3),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'food_and_drinks',
   '["Matcha lattes", "Dark chocolate", "Sparkling water"]', true, 4),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'favorite_stores',
   '["Apple", "Uniqlo", "Target", "Sephora"]', true, 5),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'tech_and_gaming',
   '["Handheld consoles", "Mechanical keyboards", "AI software"]', true, 6),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'home_and_lifestyle',
   '["Desk organization", "Cozy blankets", "Plants"]', true, 7),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'creativity',
   '["Digital art", "Photography gear"]', true, 8),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'fitness_and_wellness',
   '["Yoga", "Skincare"]', true, 9),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'experiences',
   '["Concerts", "Weekend trips"]', true, 10),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'digital_gifts',
   '["AI software subscriptions", "Streaming services"]', true, 11),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'things_to_avoid',
   '["Strong perfumes or scented products", "Novelty gifts", "Already own a French press"]',
   true, 12)
on conflict (profile_id, section_key) do nothing;

insert into public.wishlist_items (
  profile_id, name, description, category, budget_level, priority, item_type, sort_order
) values
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Portable Nintendo gaming system',
   'For cozy evenings — any recent handheld model works.', 'Tech', 'over_200', 'dream_gift', 'dream_gift', 1),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'High-quality monitor',
   'Would love an upgrade for both work and gaming.', 'Tech', 'over_200', 'dream_gift', 'dream_gift', 2),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Mechanical keyboard',
   'Quiet-ish switches preferred, but anything nice works.', 'Tech', '75_to_200', 'would_love', 'exact_item', 3),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Ergonomic productivity mouse',
   'My wrist would thank you.', 'Tech', '25_to_75', 'would_love', 'exact_item', 4),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'AI-enabled glasses',
   'The kind with a built-in assistant — very curious to try.', 'Tech', 'over_200', 'dream_gift', 'dream_gift', 5),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Tablet or iPad',
   'For sketching and reading in bed.', 'Tech', 'over_200', 'dream_gift', 'dream_gift', 6),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'AI software subscriptions',
   'A year of a favorite AI tool would be genuinely useful.', 'Tech', '25_to_75', 'would_love', 'exact_item', 7),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Creative equipment',
   'A good drawing tablet or a nice set of pens.', 'Creativity', '75_to_200', 'nice_to_have', 'general_idea', 8),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Helpful cleaning appliances',
   'A cordless handheld vacuum is high on the list.', 'Home', '75_to_200', 'nice_to_have', 'general_idea', 9),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Office accessories',
   'Cable organizers, a laptop stand, small desk upgrades.', 'Home', 'under_25', 'nice_to_have', 'general_idea', 10),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Workout equipment',
   'Resistance bands or a yoga mat upgrade.', 'Fitness', 'under_25', 'nice_to_have', 'general_idea', 11);

-- A sample exchange request, so the gift-exchange flow has something to
-- test against locally (e.g. resolve_exchange_token('local-dev-token...')).
insert into public.gift_exchange_requests (
  source_profile_id, recipient_label, exchange_token, status
) values (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Mom',
  '000000000000000000000000000000000000000000000000',
  'created'
)
on conflict (exchange_token) do nothing;
