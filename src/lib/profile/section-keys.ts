import type { GiftProfile, Sizes } from "@/types/profile";

/**
 * The camelCase GiftProfile keys backed by a profile_sections row, and
 * their snake_case section_key counterpart in the database (see the
 * profile_sections_key_allowed CHECK constraint in
 * supabase/migrations/20260717000003_profile_sections.sql). "sizes"
 * stores an object; every other key stores a string[].
 */
export const SECTION_KEY_MAP = {
  favoriteColors: "favorite_colors",
  interests: "interests",
  sizes: "sizes",
  foodAndDrinks: "food_and_drinks",
  favoriteStores: "favorite_stores",
  techAndGaming: "tech_and_gaming",
  homeAndLifestyle: "home_and_lifestyle",
  creativity: "creativity",
  fitnessAndWellness: "fitness_and_wellness",
  experiences: "experiences",
  digitalGifts: "digital_gifts",
  thingsToAvoid: "things_to_avoid",
} as const;

export type SectionTsKey = keyof typeof SECTION_KEY_MAP;
export type SectionDbKey = (typeof SECTION_KEY_MAP)[SectionTsKey];

export const SECTION_TS_KEYS = Object.keys(
  SECTION_KEY_MAP,
) as SectionTsKey[];

export const SECTION_LABELS: Record<SectionTsKey, string> = {
  favoriteColors: "Favorite colors",
  interests: "Interests and hobbies",
  sizes: "Sizes",
  foodAndDrinks: "Food and drinks",
  favoriteStores: "Favorite stores and brands",
  techAndGaming: "Technology and gaming",
  homeAndLifestyle: "Home and lifestyle",
  creativity: "Creativity",
  fitnessAndWellness: "Fitness and wellness",
  experiences: "Experiences",
  digitalGifts: "Digital gifts and subscriptions",
  thingsToAvoid: "Things to avoid",
};

const DB_TO_TS_KEY = Object.fromEntries(
  Object.entries(SECTION_KEY_MAP).map(([ts, db]) => [db, ts]),
) as Record<SectionDbKey, SectionTsKey>;

export function dbKeyToTsKey(dbKey: string): SectionTsKey | undefined {
  return DB_TO_TS_KEY[dbKey as SectionDbKey];
}

export const EMPTY_SIZES: Sizes = {
  shirt: "",
  pants: "",
  shoe: "",
  dress: "",
  ringSize: "",
};

/**
 * Sensitive-by-default sections per CLAUDE.md/product requirements —
 * hidden from the public profile until the owner explicitly turns them
 * on, even though every other section defaults to public.
 */
export const DEFAULT_HIDDEN_SECTIONS: readonly SectionTsKey[] = ["sizes"];

export function defaultSectionValue(
  key: SectionTsKey,
): GiftProfile[SectionTsKey] {
  return key === "sizes" ? EMPTY_SIZES : [];
}
