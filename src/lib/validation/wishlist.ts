import { z } from "zod";

export const wishlistItemSchema = z.object({
  name: z.string().min(1, "Enter a name for this item").max(80),
  description: z.string().max(200, "Keep it under 200 characters"),
  category: z.string().min(1, "Choose a category"),
  budgetLevel: z.enum(["under_25", "25_to_75", "75_to_200", "over_200"]),
  priority: z.enum(["nice_to_have", "would_love", "dream_gift"]),
  isPublic: z.boolean(),
  preferredSize: z.string().max(40, "Keep it under 40 characters"),
});

export type WishlistItemValues = z.infer<typeof wishlistItemSchema>;
