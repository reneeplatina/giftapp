import { z } from "zod";

export const feedbackSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Write a bit about what's on your mind")
    .max(2000, "Keep it under 2000 characters"),
});

export type FeedbackValues = z.infer<typeof feedbackSchema>;
