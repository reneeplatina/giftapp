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
});

export type InterviewTurn = z.infer<typeof interviewTurnSchema>;
