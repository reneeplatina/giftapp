import type { Sizes } from "@/types/profile";

// Checked in order against the item's name — first match wins. Mirrors
// the keyword-matching approach already used for wishlist icons.
const SIZE_TYPE_KEYWORDS: { keywords: string[]; sizeType: keyof Sizes }[] = [
  { keywords: ["ring"], sizeType: "ringSize" },
  {
    keywords: ["shoe", "shoes", "sneaker", "sneakers", "boot", "boots", "sandals", "heels", "flats", "cleats"],
    sizeType: "shoe",
  },
  { keywords: ["dress", "gown"], sizeType: "dress" },
  {
    keywords: ["pants", "jeans", "shorts", "skirt", "leggings", "trousers"],
    sizeType: "pants",
  },
  {
    keywords: [
      "shirt", "tee", "t-shirt", "hoodie", "hoodies", "sweatshirt", "jacket",
      "coat", "sweater", "blouse", "top", "cardigan", "vest",
    ],
    sizeType: "shirt",
  },
];

/** Guesses which of the profile's saved sizes applies to a wishlist item,
 * from its name. Returns null when nothing matches — callers should leave
 * the size field for the person to fill in by hand rather than guess wrong. */
export function guessSizeType(itemName: string): keyof Sizes | null {
  const lower = itemName.toLowerCase();
  for (const group of SIZE_TYPE_KEYWORDS) {
    if (group.keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`).test(lower))) {
      return group.sizeType;
    }
  }
  return null;
}
