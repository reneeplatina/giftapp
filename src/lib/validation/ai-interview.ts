import { z } from "zod";

/**
 * What the AI interview is allowed to propose extracting from the user's
 * latest answer. Deliberately a strict subset of GiftProfile: no address,
 * phone, personal email, or financial fields exist here at all, matching
 * CLAUDE.md's "never collect" list. Every field is optional — the model
 * only fills in what the user actually said.
 */
const chipList = z.array(z.string().min(1).max(80)).max(20);

export const interviewExtractionSchema = z
  .object({
    favoriteColors: chipList.optional(),
    interests: chipList.optional(),
    foodAndDrinks: chipList.optional(),
    favoriteStores: chipList.optional(),
    techAndGaming: chipList.optional(),
    homeAndLifestyle: chipList.optional(),
    creativity: chipList.optional(),
    fitnessAndWellness: chipList.optional(),
    experiences: chipList.optional(),
    digitalGifts: chipList.optional(),
    thingsToAvoid: chipList.optional(),
    sportsAndCombat: chipList.optional(),
    outdoorsAndGuns: chipList.optional(),
    faithAndValues: chipList.optional(),
    clothingAndShoes: chipList.optional(),
    moviesAndShows: chipList.optional(),
    carsAndGarage: chipList.optional(),
    diyAndCrafting: chipList.optional(),
    artAndDesign: chipList.optional(),
    booksAndReading: chipList.optional(),
    giftCardsAndSubscriptions: chipList.optional(),
    sizes: z
      .object({
        shirt: z.string().max(40).optional(),
        pants: z.string().max(40).optional(),
        shoe: z.string().max(40).optional(),
        dress: z.string().max(40).optional(),
        ringSize: z.string().max(40).optional(),
      })
      .strict()
      .optional(),
    introduction: z.string().max(500).optional(),
  })
  .strict();

export type InterviewExtraction = z.infer<typeof interviewExtractionSchema>;

/**
 * A single concrete gift idea the AI proposes mid-conversation, based
 * only on what's been said so far. Never a specific product/retailer
 * link or a price — those are the profile owner's own info to add later
 * (wishlist_items.product_url), not something the AI fabricates, per
 * docs/AI_SAFETY.md. budgetLevel/category/description are the model's
 * best guess and always editable before the user approves.
 */
export const giftSuggestionSchema = z
  .object({
    name: z.string().min(1).max(80),
    description: z.string().max(200).optional(),
    category: z.string().max(60).optional(),
    budgetLevel: z.enum(["under_25", "25_to_75", "75_to_200", "over_200"]).optional(),
  })
  .strict();

export type GiftSuggestion = z.infer<typeof giftSuggestionSchema>;

/**
 * The AI's full structured turn response — always produced via a forced
 * tool call (see src/lib/ai/interview.ts) so the shape is guaranteed at
 * the API level, then re-validated here as defense in depth before
 * anything is persisted or shown to the user.
 */
export const interviewTurnSchema = z.object({
  message: z.string().min(1).max(1200),
  topic: z.string().min(1).max(80),
  isComplete: z.boolean(),
  completionPercentage: z.number().int().min(0).max(100),
  extractedFields: interviewExtractionSchema.optional(),
  giftSuggestion: giftSuggestionSchema.optional(),
});

export type InterviewTurn = z.infer<typeof interviewTurnSchema>;
