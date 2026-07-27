export type ProfileStatus = "draft" | "published" | "hidden";

export type BudgetLevel = "under_25" | "25_to_75" | "75_to_200" | "over_200";

export type PriorityLevel = "nice_to_have" | "would_love" | "dream_gift";

export type ThemeKey =
  | "general"
  | "birthday"
  | "christmas"
  | "anniversary"
  | "graduation"
  | "valentines"
  | "mothers_day"
  | "fathers_day"
  | "wedding"
  | "baby_shower"
  | "housewarming";

export interface ThemeOption {
  key: ThemeKey;
  label: string;
  accent: string;
  /** Soft, light background tint for the public profile page/preview. */
  background: string;
}

export interface BasicInfo {
  displayName: string;
  slug: string;
  introduction: string;
  giftStyleSummary: string;
  avatarUrl: string | null;
}

export interface Sizes {
  shirt: string;
  pants: string;
  shoe: string;
  dress: string;
  ringSize: string;
}

export type SectionVisibility = Record<
  | "favoriteColors"
  | "interests"
  | "sizes"
  | "foodAndDrinks"
  | "favoriteStores"
  | "techAndGaming"
  | "homeAndLifestyle"
  | "creativity"
  | "fitnessAndWellness"
  | "experiences"
  | "digitalGifts"
  | "thingsToAvoid"
  | "sportsAndCombat"
  | "outdoorsAndGuns"
  | "faithAndValues"
  | "clothingAndShoes"
  | "moviesAndShows"
  | "carsAndGarage"
  | "diyAndCrafting"
  | "artAndDesign"
  | "booksAndReading"
  | "giftCardsAndSubscriptions",
  boolean
>;

export interface PrivacySettings {
  status: ProfileStatus;
  sectionVisibility: SectionVisibility;
}

export interface GiftProfile {
  basicInfo: BasicInfo;
  favoriteColors: string[];
  interests: string[];
  sizes: Sizes;
  foodAndDrinks: string[];
  favoriteStores: string[];
  techAndGaming: string[];
  homeAndLifestyle: string[];
  creativity: string[];
  fitnessAndWellness: string[];
  experiences: string[];
  digitalGifts: string[];
  thingsToAvoid: string[];
  sportsAndCombat: string[];
  outdoorsAndGuns: string[];
  faithAndValues: string[];
  clothingAndShoes: string[];
  moviesAndShows: string[];
  carsAndGarage: string[];
  diyAndCrafting: string[];
  artAndDesign: string[];
  booksAndReading: string[];
  giftCardsAndSubscriptions: string[];
  privacy: PrivacySettings;
}

export type ProfileSectionKey =
  | "basicInfo"
  | "favoriteColors"
  | "interests"
  | "sizes"
  | "foodAndDrinks"
  | "favoriteStores"
  | "techAndGaming"
  | "homeAndLifestyle"
  | "creativity"
  | "fitnessAndWellness"
  | "experiences"
  | "digitalGifts"
  | "thingsToAvoid"
  | "sportsAndCombat"
  | "outdoorsAndGuns"
  | "faithAndValues"
  | "clothingAndShoes"
  | "moviesAndShows"
  | "carsAndGarage"
  | "diyAndCrafting"
  | "artAndDesign"
  | "booksAndReading"
  | "giftCardsAndSubscriptions"
  | "privacy";

export interface WishlistItem {
  id: string;
  name: string;
  description: string;
  category: string;
  budgetLevel: BudgetLevel;
  priority: PriorityLevel;
  isPublic: boolean;
  isArchived: boolean;
}
