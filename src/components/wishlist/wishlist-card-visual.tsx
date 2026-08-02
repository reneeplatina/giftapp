import { Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const GIFT_CARD_CATEGORY = "Gift cards";
const UNSPLASH_UTM = "utm_source=giftmeapp&utm_medium=referral";

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
 * A wishlist item's visual: an uploaded or auto-fetched photo if there is
 * one, a high-contrast "Gift Card" placeholder for that category, or the
 * item's name as large text on a color so the card never looks blank.
 * Unsplash-sourced photos carry photographer credit, per Unsplash's API
 * terms, linking back to both the photographer and Unsplash.
 */
export function WishlistCardVisual({
  name,
  category,
  imageUrl,
  imageAttributionName,
  imageAttributionUrl,
  className,
}: {
  name: string;
  category: string;
  imageUrl: string | null;
  imageAttributionName?: string | null;
  imageAttributionUrl?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={cn("relative h-32 w-full", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full rounded-lg object-cover"
        />
        {imageAttributionName && imageAttributionUrl && (
          <span className="absolute bottom-1 right-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
            Photo:{" "}
            <a
              href={`${imageAttributionUrl}?${UNSPLASH_UTM}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {imageAttributionName}
            </a>{" "}
            /{" "}
            <a
              href={`https://unsplash.com/?${UNSPLASH_UTM}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Unsplash
            </a>
          </span>
        )}
      </div>
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
