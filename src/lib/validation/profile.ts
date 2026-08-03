import { z } from "zod";
import { RESERVED_SLUGS } from "@/lib/profile/reserved-slugs";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const basicInfoSchema = z.object({
  displayName: z.string().min(1, "Enter a display name").max(60),
  slug: z
    .string()
    .min(3, "Use at least 3 characters")
    .max(40)
    .regex(
      slugPattern,
      "Use lowercase letters, numbers, and hyphens only",
    )
    .refine((value) => !(RESERVED_SLUGS as readonly string[]).includes(value), {
      message: "This link is reserved — choose another",
    }),
  introduction: z.string().max(280, "Keep it under 280 characters"),
  giftStyleSummary: z.string().max(160, "Keep it under 160 characters"),
});

export type BasicInfoValues = z.infer<typeof basicInfoSchema>;

export const sizesSchema = z.object({
  shirt: z.string().max(20),
  pants: z.string().max(20),
  shoe: z.string().max(20),
  dress: z.string().max(20),
  ringSize: z.string().max(20),
});

export type SizesValues = z.infer<typeof sizesSchema>;

export const stringListSchema = z.object({
  items: z.array(z.string()),
});

export type StringListValues = z.infer<typeof stringListSchema>;

export const privacySchema = z.object({
  status: z.enum(["draft", "published", "hidden"]),
  showSizesPublicly: z.boolean(),
  showDreamGiftsPublicly: z.boolean(),
  showAvoidListPublicly: z.boolean(),
});

export type PrivacyValues = z.infer<typeof privacySchema>;

export const avatarEmojiSchema = z.object({
  emoji: z.string().min(1).max(8),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export type AvatarEmojiValues = z.infer<typeof avatarEmojiSchema>;
