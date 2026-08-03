import {
  Baby,
  BookOpen,
  Car,
  Dumbbell,
  Film,
  Gift,
  Heart,
  Home,
  Laptop,
  Mountain,
  Paintbrush,
  Palette,
  Shirt,
  Sparkles,
  Swords,
  Ticket,
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
  "Cars and garage": Car,
  "DIY and crafting": Wrench,
  "Art and design": Paintbrush,
  Reading: BookOpen,
  "Gift cards": Gift,
  "Kids toys": Baby,
};

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
 * A wishlist item's visual: an icon matching its category, plus the
 * item's name as large text, on a color — no photos, so every card looks
 * the same intentional way regardless of what's actually been described.
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
  const Icon = CATEGORY_ICONS[category] ?? Sparkles;
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
