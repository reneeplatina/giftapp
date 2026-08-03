import {
  Baby,
  Backpack,
  Bike,
  Blocks,
  BookOpen,
  Cake,
  Camera,
  Candy,
  CarFront,
  Cat,
  ChefHat,
  Coffee,
  Dog,
  Dumbbell,
  Film,
  Fish,
  Flame,
  Flower2,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Glasses,
  Guitar,
  Hammer,
  Handbag,
  Headphones,
  Heart,
  Home,
  Laptop,
  Luggage,
  Mountain,
  Music,
  Paintbrush,
  Palette,
  Pencil,
  Plane,
  Puzzle,
  Scissors,
  Shirt,
  Smartphone,
  Sparkles,
  Speaker,
  SprayCan,
  Sprout,
  Swords,
  Ticket,
  Utensils,
  Watch,
  Wine,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Tech: Laptop,
  Home,
  Fitness: Dumbbell,
  Fashion: Shirt,
  Creativity: Palette,
  Experiences: Ticket,
  "Sports and combat": Swords,
  Outdoors: Mountain,
  Faith: Heart,
  "Movies and shows": Film,
  "Cars and garage": CarFront,
  "DIY and crafting": Wrench,
  "Art and design": Paintbrush,
  Reading: BookOpen,
  "Gift cards": Gift,
  "Kids toys": Baby,
};

// Checked in order against the item's name — first match wins. Grouped by
// what people actually type ("bogg bag", "airpods", "pens"), not by
// formal product category, since that's a lot more specific than the
// 16-way category split.
const ITEM_ICONS: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["bag", "purse", "tote", "clutch", "handbag", "wallet"], icon: Handbag },
  { keywords: ["backpack", "rucksack"], icon: Backpack },
  { keywords: ["luggage", "suitcase"], icon: Luggage },
  { keywords: ["pen", "pens", "pencil", "pencils", "marker", "highlighter"], icon: Pencil },
  { keywords: ["plant", "plants", "succulent", "houseplant"], icon: Sprout },
  { keywords: ["flower", "flowers", "bouquet", "floral"], icon: Flower2 },
  { keywords: ["necklace", "earrings", "bracelet", "jewelry", "jewellery", "ring"], icon: Gem },
  { keywords: ["watch", "smartwatch"], icon: Watch },
  { keywords: ["sunglasses", "glasses"], icon: Glasses },
  { keywords: ["shoes", "sneakers", "boots", "sandals", "heels"], icon: Footprints },
  { keywords: ["airpods", "earbuds", "headphones", "headset"], icon: Headphones },
  { keywords: ["speaker", "speakers"], icon: Speaker },
  { keywords: ["iphone", "phone", "smartphone"], icon: Smartphone },
  { keywords: ["laptop", "macbook", "chromebook", "computer"], icon: Laptop },
  { keywords: ["camera"], icon: Camera },
  {
    keywords: ["game", "games", "videogame", "console", "xbox", "playstation", "nintendo", "switch"],
    icon: Gamepad2,
  },
  { keywords: ["candle", "candles"], icon: Flame },
  { keywords: ["coffee", "espresso", "latte", "mug", "tea"], icon: Coffee },
  { keywords: ["wine", "champagne"], icon: Wine },
  { keywords: ["book", "books", "novel", "journal", "notebook"], icon: BookOpen },
  { keywords: ["guitar"], icon: Guitar },
  { keywords: ["music", "instrument", "vinyl", "records"], icon: Music },
  { keywords: ["bike", "bicycle", "cycling"], icon: Bike },
  { keywords: ["puzzle"], icon: Puzzle },
  { keywords: ["lego", "legos", "blocks", "building set"], icon: Blocks },
  { keywords: ["toy", "toys", "doll", "stuffed animal", "plush"], icon: Baby },
  { keywords: ["makeup", "cosmetics", "lipstick", "perfume", "cologne", "fragrance", "skincare"], icon: SprayCan },
  { keywords: ["screwdriver", "toolkit", "tools", "tool"], icon: Wrench },
  { keywords: ["hammer"], icon: Hammer },
  { keywords: ["paint", "canvas", "craft", "crafting", "drawing"], icon: Paintbrush },
  { keywords: ["scissors"], icon: Scissors },
  { keywords: ["yoga", "gym", "weights", "dumbbell", "dumbbells"], icon: Dumbbell },
  { keywords: ["car", "vehicle"], icon: CarFront },
  { keywords: ["flight", "travel"], icon: Plane },
  { keywords: ["pot", "pan", "cookware", "cooking"], icon: ChefHat },
  { keywords: ["utensils", "cutlery"], icon: Utensils },
  { keywords: ["cake", "baking", "dessert"], icon: Cake },
  { keywords: ["candy", "chocolate", "sweets"], icon: Candy },
  { keywords: ["dog", "puppy"], icon: Dog },
  { keywords: ["cat", "kitten"], icon: Cat },
  { keywords: ["fish", "aquarium"], icon: Fish },
];

// Deterministic-per-item palette so a wishlist reads as varied and
// intentional rather than a wall of identically-colored cards.
const PLACEHOLDER_COLORS = [
  { bg: "#fdf2f8", text: "#9d174d" },
  { bg: "#eff6ff", text: "#1e3a8a" },
  { bg: "#f0fdf4", text: "#14532d" },
  { bg: "#fff7ed", text: "#7c2d12" },
  { bg: "#faf5ff", text: "#581c87" },
  { bg: "#f0fdfa", text: "#134e4a" },
  { bg: "#fef2f2", text: "#7f1d1d" },
  { bg: "#f5f5f4", text: "#292524" },
];

function colorForText(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return PLACEHOLDER_COLORS[hash % PLACEHOLDER_COLORS.length];
}

/**
 * A wishlist item's visual: an icon matching its name where a keyword's
 * recognized (a "bogg bag" gets a bag icon, "pens" gets a pencil icon),
 * falling back to a generic icon for its category, plus the item's name
 * as large text, on a color — no photos.
 */
export function WishlistCardVisual({
  name,
  category,
  className,
}: {
  name: string;
  category: string;
  className?: string;
}) {
  if (category === "Gift cards") {
    return (
      <div
        className={cn(
          "flex h-32 w-full flex-col justify-between rounded-lg bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-3.5 text-white shadow-inner",
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <span
            className="h-5 w-7 rounded-[3px] bg-gradient-to-br from-yellow-200 to-yellow-500"
            aria-hidden="true"
          />
          <Gift className="h-5 w-5 text-white/60" aria-hidden="true" />
        </div>
        <div>
          <p className="line-clamp-2 text-base font-bold leading-tight">{name}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/50">
            Gift Card
          </p>
        </div>
      </div>
    );
  }

  let matchedIcon: LucideIcon | null = null;
  const lowerName = name.toLowerCase();
  for (const group of ITEM_ICONS) {
    if (group.keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`).test(lowerName))) {
      matchedIcon = group.icon;
      break;
    }
  }
  const Icon = matchedIcon ?? CATEGORY_ICONS[category] ?? Sparkles;
  const { bg, text } = colorForText(name || category);

  return (
    <div
      className={cn(
        "flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg p-3",
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      <Icon className="h-6 w-6" style={{ color: text }} aria-hidden="true" />
      <span
        className="line-clamp-2 text-center text-lg font-bold leading-tight"
        style={{ color: text }}
      >
        {name}
      </span>
    </div>
  );
}
