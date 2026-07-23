import type {
  BudgetLevel,
  PriorityLevel,
  ThemeOption,
  WishlistItem,
} from "@/types/profile";

export const BUDGET_LABELS: Record<BudgetLevel, string> = {
  under_25: "Under $25",
  "25_to_75": "$25 – $75",
  "75_to_200": "$75 – $200",
  over_200: "$200+",
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  nice_to_have: "Nice to have",
  would_love: "Would love",
  dream_gift: "Dream gift",
};

export const THEME_OPTIONS: ThemeOption[] = [
  { key: "general", label: "General", accent: "#1c1917" },
  { key: "birthday", label: "Birthday", accent: "#db2777" },
  { key: "christmas", label: "Christmas", accent: "#166534" },
  { key: "anniversary", label: "Anniversary", accent: "#9f1239" },
  { key: "graduation", label: "Graduation", accent: "#1d4ed8" },
  { key: "valentines", label: "Valentine's Day", accent: "#e11d48" },
  { key: "mothers_day", label: "Mother's Day", accent: "#d946ef" },
  { key: "fathers_day", label: "Father's Day", accent: "#0f766e" },
  { key: "wedding", label: "Wedding", accent: "#a8a29e" },
  { key: "baby_shower", label: "Baby Shower", accent: "#7dd3fc" },
  { key: "housewarming", label: "Housewarming", accent: "#c2410c" },
];

export const COLOR_OPTIONS = [
  "Black",
  "White",
  "Pink",
  "Navy",
  "Sage green",
  "Cream",
  "Burgundy",
  "Gold",
  "Lavender",
  "Charcoal",
];

export const INTEREST_OPTIONS = [
  "Cozy gaming",
  "Technology",
  "Artificial intelligence tools",
  "Creative work",
  "Web design",
  "Home and office upgrades",
  "Fitness and wellness",
  "Helpful household tools",
  "Reading",
  "Travel",
  "Photography",
  "Cooking",
];

export const FOOD_AND_DRINK_OPTIONS = [
  "Matcha lattes",
  "Dark chocolate",
  "Spicy snacks",
  "Sparkling water",
  "Good coffee",
  "Sushi",
];

export const STORE_OPTIONS = [
  "Apple",
  "Uniqlo",
  "Target",
  "Sephora",
  "REI",
  "Muji",
];

export const TECH_AND_GAMING_OPTIONS = [
  "Handheld consoles",
  "Mechanical keyboards",
  "Smart home gadgets",
  "AI software",
  "Productivity tools",
  "Noise-cancelling audio",
];

export const HOME_AND_LIFESTYLE_OPTIONS = [
  "Cozy blankets",
  "Scented candles",
  "Desk organization",
  "Plants",
  "Minimalist decor",
];

export const CREATIVITY_OPTIONS = [
  "Sketching",
  "Digital art",
  "Journaling",
  "Photography gear",
  "DIY projects",
];

export const FITNESS_AND_WELLNESS_OPTIONS = [
  "Yoga",
  "Strength training",
  "Running",
  "Skincare",
  "Meditation apps",
];

export const EXPERIENCE_OPTIONS = [
  "Concerts",
  "Weekend trips",
  "Cooking classes",
  "Museum visits",
  "Spa days",
];

export const DIGITAL_GIFT_OPTIONS = [
  "AI software subscriptions",
  "Streaming services",
  "Cloud storage",
  "App store gift cards",
  "Online course credits",
];

export const CATEGORY_OPTIONS = [
  "Tech",
  "Home",
  "Fitness",
  "Fashion",
  "Creativity",
  "Experiences",
];

export const INITIAL_WISHLIST_ITEMS: WishlistItem[] = [
  {
    id: "wl-1",
    name: "Portable Nintendo gaming system",
    description: "For cozy evenings — any recent handheld model works.",
    category: "Tech",
    budgetLevel: "over_200",
    priority: "dream_gift",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-2",
    name: "High-quality monitor",
    description: "Would love an upgrade for both work and gaming.",
    category: "Tech",
    budgetLevel: "over_200",
    priority: "dream_gift",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-3",
    name: "Mechanical keyboard",
    description: "Quiet-ish switches preferred, but anything nice works.",
    category: "Tech",
    budgetLevel: "75_to_200",
    priority: "would_love",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-4",
    name: "Ergonomic productivity mouse",
    description: "My wrist would thank you.",
    category: "Tech",
    budgetLevel: "25_to_75",
    priority: "would_love",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-5",
    name: "AI-enabled glasses",
    description: "The kind with a built-in assistant — very curious to try.",
    category: "Tech",
    budgetLevel: "over_200",
    priority: "dream_gift",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-6",
    name: "Tablet or iPad",
    description: "For sketching and reading in bed.",
    category: "Tech",
    budgetLevel: "over_200",
    priority: "dream_gift",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-7",
    name: "AI software subscriptions",
    description: "A year of a favorite AI tool would be genuinely useful.",
    category: "Tech",
    budgetLevel: "25_to_75",
    priority: "would_love",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-8",
    name: "Creative equipment",
    description: "A good drawing tablet or a nice set of pens.",
    category: "Creativity",
    budgetLevel: "75_to_200",
    priority: "nice_to_have",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-9",
    name: "Helpful cleaning appliances",
    description: "A cordless handheld vacuum is high on the list.",
    category: "Home",
    budgetLevel: "75_to_200",
    priority: "nice_to_have",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-10",
    name: "Office accessories",
    description: "Cable organizers, a laptop stand, small desk upgrades.",
    category: "Home",
    budgetLevel: "under_25",
    priority: "nice_to_have",
    isPublic: true,
    isArchived: false,
  },
  {
    id: "wl-11",
    name: "Workout equipment",
    description: "Resistance bands or a yoga mat upgrade.",
    category: "Fitness",
    budgetLevel: "under_25",
    priority: "nice_to_have",
    isPublic: true,
    isArchived: false,
  },
];
