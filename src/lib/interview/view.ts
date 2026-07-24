import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  getInterviewSessionById,
  listInterviewMessages,
  type AssistantTurnEnvelope,
} from "@/lib/interview/dal";
import type { GiftSuggestion, InterviewExtraction } from "@/lib/validation/ai-interview";

/**
 * Read-side view types/helpers shared between the "use server" action
 * file and the server page component. Kept in a plain module (not "use
 * server") since Next.js requires every export of a "use server" file to
 * be an async server action, and the page component needs to call this
 * directly at render time rather than through an action.
 */
export interface InterviewMessageView {
  id: string;
  role: "user" | "assistant";
  content: string;
  topic?: string;
  extractedFields?: InterviewExtraction;
  extractionResolved?: boolean;
  extractionApplied?: boolean;
  giftSuggestion?: GiftSuggestion;
  giftSuggestionResolved?: boolean;
  giftSuggestionApplied?: boolean;
}

export interface InterviewStateView {
  sessionId: string;
  status: "in_progress" | "completed" | "abandoned";
  completionPercentage: number;
  isComplete: boolean;
  messages: InterviewMessageView[];
}

export function toMessageView(row: {
  id: string;
  role: "user" | "assistant";
  content: string;
  structured_updates: unknown;
}): InterviewMessageView {
  const envelope = row.structured_updates as AssistantTurnEnvelope | null;
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    topic: envelope?.topic,
    extractedFields: envelope?.extractedFields as InterviewExtraction | undefined,
    extractionResolved: Boolean(envelope?.extractionResolution),
    extractionApplied: envelope?.extractionResolution?.applied,
    giftSuggestion: envelope?.giftSuggestion as GiftSuggestion | undefined,
    giftSuggestionResolved: Boolean(envelope?.giftSuggestionResolution),
    giftSuggestionApplied: envelope?.giftSuggestionResolution?.applied,
  };
}

export async function loadInterviewStateView(
  sessionId: string,
  profileId: string,
): Promise<InterviewStateView | null> {
  const supabase = await createClient();
  const session = await getInterviewSessionById(supabase, sessionId, profileId);
  if (!session) return null;
  const rows = await listInterviewMessages(sessionId);
  return {
    sessionId: session.id,
    status: session.status,
    completionPercentage: session.completion_percentage,
    isComplete:
      (rows.at(-1)?.structured_updates as AssistantTurnEnvelope | null)?.isComplete ?? false,
    messages: rows.map(toMessageView),
  };
}
