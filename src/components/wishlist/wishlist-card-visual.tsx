import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const GIFT_CARD_CATEGORY = "Gift cards";

// Deterministic-per-item palette so a wishlist without photos still reads
// as varied and intentional rather than a wall of identical gray boxes.
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
 * A wishlist item's visual: the uploaded photo if there is one, a
 * high-contrast "Gift Card" placeholder for that category, or the item's
 * name as large text on a color so the card never looks blank.
 */
export function WishlistCardVisual({
  name,
  category,
  imageUrl,
  className,
}: {
  name: string;
  category: string;
  imageUrl: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={cn("h-32 w-full rounded-lg object-cover", className)}
      />
    );
  }

  if (category === GIFT_CARD_CATEGORY) {
    return (
      <div
        className={cn(
          "flex h-32 w-full items-center justify-center rounded-lg bg-neutral-900",
          className,
        )}
      >
        <span className="flex items-center gap-2 text-lg font-semibold text-white">
          <Gift className="h-5 w-5" aria-hidden="true" />
          Gift Card
        </span>
      </div>
    );
  }

  const { bg, text } = colorForText(name || category);
  return (
    <div
      className={cn(
        "flex h-32 w-full items-center justify-center rounded-lg p-3",
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      <span
        className="line-clamp-3 text-center text-lg font-bold leading-tight"
        style={{ color: text }}
      >
        {name}
      </span>
    </div>
  );
}
