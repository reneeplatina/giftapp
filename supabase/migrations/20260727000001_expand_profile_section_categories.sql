-- Adds 10 new profile section categories the product was missing entirely
-- (sports/combat, outdoors, faith, clothing/shoes, movies, cars, DIY/crafting,
-- art, books, gift cards/subscriptions). Purely additive: widens the
-- section_key allow-list, no existing rows or columns touched.

alter table public.profile_sections
  drop constraint profile_sections_key_allowed;

alter table public.profile_sections
  add constraint profile_sections_key_allowed check (
    section_key in (
      'favorite_colors', 'interests', 'sizes', 'food_and_drinks',
      'favorite_stores', 'tech_and_gaming', 'home_and_lifestyle',
      'creativity', 'fitness_and_wellness', 'experiences',
      'digital_gifts', 'things_to_avoid',
      'sports_and_combat', 'outdoors_and_guns', 'faith_and_values',
      'clothing_and_shoes', 'movies_and_shows', 'cars_and_garage',
      'diy_and_crafting', 'art_and_design', 'books_and_reading',
      'gift_cards_and_subscriptions'
    )
  );
