import type { BudgetLevel, PriorityLevel, ThemeOption } from "@/types/profile";

export const BUDGET_LABELS: Record<BudgetLevel, string> = {
  under_25: "$ Under $25",
  "25_to_75": "$$ $25 – $75",
  "75_to_200": "$$ $75 – $200",
  over_200: "$$$ $200+",
};

export type BudgetTier = "cheap" | "middle" | "expensive";

export const BUDGET_TIER_ORDER: BudgetTier[] = ["cheap", "middle", "expensive"];

export const BUDGET_TIER_BY_LEVEL: Record<BudgetLevel, BudgetTier> = {
  under_25: "cheap",
  "25_to_75": "middle",
  "75_to_200": "middle",
  over_200: "expensive",
};

export const BUDGET_TIER_SYMBOL: Record<BudgetTier, string> = {
  cheap: "$",
  middle: "$$",
  expensive: "$$$",
};

export const BUDGET_TIER_LABEL: Record<BudgetTier, string> = {
  cheap: "Low range",
  middle: "Mid range",
  expensive: "High range",
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  nice_to_have: "Nice to have",
  would_love: "Would love",
  dream_gift: "Dream gift",
};

export const THEME_OPTIONS: ThemeOption[] = [
  { key: "general", label: "Charcoal", accent: "#1c1917", background: "#e7e5e4" },
  { key: "rose", label: "Rose", accent: "#e11d48", background: "#fecdd3" },
  { key: "blush", label: "Blush", accent: "#db2777", background: "#fbcfe8" },
  { key: "amber", label: "Amber", accent: "#c2410c", background: "#fed7aa" },
  { key: "sage", label: "Sage", accent: "#166534", background: "#bbf7d0" },
  { key: "teal", label: "Teal", accent: "#0f766e", background: "#99f6e4" },
  { key: "sky", label: "Sky", accent: "#1d4ed8", background: "#bfdbfe" },
  { key: "lavender", label: "Lavender", accent: "#9333ea", background: "#e9d5ff" },
  { key: "stone", label: "Stone", accent: "#78716c", background: "#d6d3d1" },
  {
    key: "rainbow",
    label: "Rainbow",
    accent: "#db2777",
    background: "#fdf4ff",
    gradient: "linear-gradient(135deg, #f43f5e, #f97316, #eab308, #22c55e, #0ea5e9, #8b5cf6)",
  },
  {
    key: "christmas",
    label: "Christmas",
    accent: "#b91c1c",
    background: "#f0fdf4",
    gradient: "linear-gradient(180deg, #bbf7d0 0%, #dcfce7 40%, #f0fdf4 100%)",
  },
];

export const COLOR_OPTIONS = [
  "Black",
  "White",
  "Gray",
  "Pink",
  "Red",
  "Orange",
  "Yellow",
  "Navy",
  "Royal blue",
  "Sky blue",
  "Sage green",
  "Emerald green",
  "Cream",
  "Beige",
  "Brown",
  "Burgundy",
  "Purple",
  "Gold",
  "Silver",
  "Rose gold",
  "Lavender",
  "Teal",
  "Charcoal",
  "Camo",
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
  "Baking",
  "Gardening",
  "Board games",
  "Puzzles",
  "Hiking",
  "Fishing",
  "Camping",
  "Music",
  "Playing an instrument",
  "Podcasts",
  "History",
  "Astronomy and space",
  "Collecting things",
  "Volunteering",
  "Pets and animals",
];

export const FOOD_AND_DRINK_OPTIONS = [
  "Matcha lattes",
  "Dark chocolate",
  "Spicy snacks",
  "Sparkling water",
  "Good coffee",
  "Sushi",
  "Craft beer",
  "Wine",
  "Cocktails",
  "BBQ",
  "Tacos and Mexican food",
  "Italian food",
  "Baked goods and desserts",
  "Cheese and charcuterie",
  "Hot sauce",
  "Energy drinks",
  "Tea",
  "Snack boxes",
  "Meal kits",
  "Grilling and smoking meat",
];

export const STORE_OPTIONS = [
  "Apple",
  "Uniqlo",
  "Target",
  "Sephora",
  "REI",
  "Muji",
  "Amazon",
  "Costco",
  "Home Depot",
  "Lowe's",
  "Bass Pro Shops",
  "Cabela's",
  "Dick's Sporting Goods",
  "Best Buy",
  "Nike",
  "Lululemon",
  "IKEA",
  "Trader Joe's",
  "Whole Foods",
  "Etsy",
];

export const TECH_AND_GAMING_OPTIONS = [
  "Handheld consoles",
  "Mechanical keyboards",
  "Smart home gadgets",
  "AI software",
  "Productivity tools",
  "Noise-cancelling audio",
  "PC gaming gear",
  "PlayStation games",
  "Xbox games",
  "Nintendo Switch games",
  "VR headsets",
  "Streaming setup gear",
  "Drones",
  "Camera gear",
  "Smart watches",
  "Phone accessories",
  "Board/tabletop games",
  "Retro gaming",
];

export const HOME_AND_LIFESTYLE_OPTIONS = [
  "Cozy blankets",
  "Scented candles",
  "Desk organization",
  "Plants",
  "Minimalist decor",
  "Kitchen gadgets",
  "Coffee and espresso gear",
  "Bedding and pillows",
  "Air fryers and small appliances",
  "Smart home devices",
  "Grilling accessories",
  "Storage and organization",
  "Wall art and prints",
  "Rugs and throws",
  "Garage and tool storage",
];

export const CREATIVITY_OPTIONS = [
  "Sketching",
  "Digital art",
  "Journaling",
  "Photography gear",
  "DIY projects",
  "Painting",
  "Calligraphy",
  "Knitting and crochet",
  "Sewing",
  "Pottery",
  "Scrapbooking",
  "Woodworking",
  "Jewelry making",
];

export const FITNESS_AND_WELLNESS_OPTIONS = [
  "Yoga",
  "Strength training",
  "Running",
  "Skincare",
  "Meditation apps",
  "Home gym equipment",
  "Recovery and massage tools",
  "Cycling",
  "Golf",
  "Hiking gear",
  "Sleep and recovery",
  "Supplements and nutrition",
  "Athletic wear",
];

export const EXPERIENCE_OPTIONS = [
  "Concerts",
  "Weekend trips",
  "Cooking classes",
  "Museum visits",
  "Spa days",
  "Sporting events",
  "Amusement parks",
  "Wine or brewery tours",
  "Escape rooms",
  "Comedy shows",
  "Fishing or hunting trips",
  "Golf outings",
  "Shooting range time",
];

export const DIGITAL_GIFT_OPTIONS = [
  "AI software subscriptions",
  "Streaming services",
  "Cloud storage",
  "App store gift cards",
  "Online course credits",
  "Audiobook subscriptions",
  "Ebook credits",
  "Music streaming",
  "Gaming subscriptions",
];

export const SPORTS_AND_COMBAT_OPTIONS = [
  "Brazilian jiu jitsu",
  "Wrestling",
  "Boxing",
  "Muay Thai",
  "MMA",
  "Judo",
  "Karate",
  "Gi and rashguards",
  "Grappling gear",
  "Football",
  "Basketball",
  "Baseball",
  "Soccer",
  "Golf gear",
  "Weightlifting",
];

export const OUTDOORS_OPTIONS = [
  "Hunting gear",
  "Camping gear",
  "Fishing gear",
  "Hiking gear",
  "Backpacking",
  "Archery",
  "Off-roading and ATVs",
  "Survival gear",
  "Knives and multitools",
  "Binoculars and optics",
  "Kayaking and canoeing",
  "Birdwatching",
];

export const FAITH_OPTIONS = [
  "Bibles",
  "Qurans",
  "Torahs",
  "Prayer beads and rosaries",
  "Religious jewelry",
  "Devotionals and prayer books",
  "Faith-based books",
  "Religious art and icons",
  "Meditation and mindfulness",
  "Church, temple, mosque, or synagogue events",
  "Prayer journals",
  "Inspirational and spiritual gifts",
];

export const CLOTHING_AND_SHOES_OPTIONS = [
  "Sneakers",
  "Boots",
  "Sandals",
  "Athletic shoes",
  "Jeans",
  "Hoodies and sweatshirts",
  "Jackets and coats",
  "Dresses",
  "Activewear",
  "Pajamas",
  "Socks",
  "Accessories (belts, hats, bags)",
  "Jewelry",
];

export const MOVIES_AND_SHOWS_OPTIONS = [
  "Action movies",
  "Comedies",
  "Horror movies",
  "Sci-fi and fantasy",
  "True crime",
  "Anime",
  "Sports documentaries",
  "Classic films",
  "Blu-ray/4K collector's editions",
  "Movie theater trips",
  "Streaming subscriptions",
];

export const CARS_AND_GARAGE_OPTIONS = [
  "Car detailing supplies",
  "Car accessories",
  "Tools and toolboxes",
  "Motorcycle gear",
  "Car audio",
  "Dash cams",
  "Garage organization",
  "Car shows and events",
  "Model cars",
  "Gas cards",
];

export const DIY_AND_CRAFTING_OPTIONS = [
  "Woodworking tools",
  "Power tools",
  "3D printing",
  "Home improvement projects",
  "Building and construction kits",
  "Model building",
  "Soldering and electronics",
  "Upholstery and repair",
  "Leatherworking",
];

export const ART_AND_DESIGN_OPTIONS = [
  "Fine art supplies",
  "Graphic design software",
  "Prints and posters",
  "Sculpture",
  "Graffiti and street art",
  "Museum memberships",
  "Art classes",
  "Sketchbooks",
  "Custom portraits/commissions",
];

export const READING_OPTIONS = [
  "Fiction",
  "Nonfiction",
  "Fantasy",
  "Mystery and thriller",
  "Biographies",
  "Self-help and productivity",
  "Cookbooks",
  "Comics and graphic novels",
  "Audiobooks",
  "Audible subscription",
  "Podcast gear",
  "E-reader accessories",
  "Bookstore gift cards",
];

export const KIDS_TOYS_AND_SENSORY_OPTIONS = [
  "Slime making kits",
  "Squishies",
  "Kinetic sand",
  "Play-Doh and modeling clay",
  "Sensory bins",
  "Fidget toys",
  "Building blocks and LEGO",
  "Stuffed animals and plushies",
  "Dolls and action figures",
  "Board games for kids",
  "Arts and crafts kits",
  "Remote control toys",
  "Outdoor play toys",
  "Educational toys",
  "Puzzles for kids",
  "Weighted and calming sensory toys",
];

export const GIFT_CARDS_AND_SUBSCRIPTIONS_OPTIONS = [
  "Netflix",
  "Xbox Game Pass",
  "PlayStation Plus",
  "Nintendo eShop",
  "Amazon",
  "Gas card",
  "Restaurant gift card",
  "Movie theater gift card",
  "Coffee shop gift card",
  "Grocery store gift card",
  "Spa or salon gift card",
  "Home improvement store gift card",
  "Clothing store gift card",
  "Steam (PC games)",
  "Spotify or Apple Music",
];

export const CATEGORY_OPTIONS = [
  "Tech",
  "Home",
  "Fitness",
  "Fashion",
  "Creativity",
  "Experiences",
  "Sports and combat",
  "Outdoors",
  "Faith",
  "Movies and shows",
  "Cars and garage",
  "DIY and crafting",
  "Art and design",
  "Reading",
  "Gift cards",
  "Kids toys",
];

export const AVATAR_EMOJI_GROUPS: { label: string; emoji: string[] }[] = [
  {
    label: "Characters",
    emoji: ["😀", "😎", "🤠", "🥸", "🤓", "🥳", "🧑‍🚀", "🦸", "🧙", "🤖", "👽", "👻", "🎃", "🥷", "🧛", "🧑‍🎨"],
  },
  {
    label: "Animals",
    emoji: ["🐶", "🐱", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐵", "🐰", "🐸", "🦄", "🐷", "🐮", "🦉", "🐢"],
  },
  {
    label: "Food",
    emoji: ["🍕", "🍔", "🌮", "🍩", "🍦", "🍓", "🍉", "🍪", "🧁", "🍎", "🥑", "🍒", "🥕", "🍿", "🍇", "🍰"],
  },
  {
    label: "Sports",
    emoji: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🥎", "🏒", "⛳", "🏄", "🚴", "🎳", "🥊", "🏂"],
  },
];

export const AVATAR_BG_COLORS = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#78716c",
];

