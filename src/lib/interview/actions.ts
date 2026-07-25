"use server";

import { getAuthUser } from "@/lib/auth/dal";
import { getActiveProfileId } from "@/lib/profile/active";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, getAnthropicModel } from "@/lib/ai/client";
import { AIAssistantError } from "@/lib/ai/errors";
import { generateGiftStyleSummary, runInterviewTurn } from "@/lib/ai/interview";
import { checkAndRecordAiUsage } from "@/lib/ai/rate-limit";
import { applyInterviewExtraction } from "@/lib/interview/apply-updates";
import {
  createInterviewSession,
  deleteInterviewMessages,
  getInterviewSessionById,
  insertInterviewMessage,
  listInterviewMessages,
  updateInterviewSession,
  updateMessageEnvelope,
  type AssistantTurnEnvelope,
} from "@/lib/interview/dal";
import { SECTION_KEY_MAP, SECTION_TS_KEYS, dbKeyToTsKey } from "@/lib/profile/section-keys";
import { loadInterviewStateView, toMessageView, type InterviewStateView } from "@/lib/interview/view";
import { interviewExtractionSchema } from "@/lib/validation/ai-interview";

const AI_FEATURE_NAME = "ai_interview";
const SKIP_ANSWER_TEXT = "(I'd like to skip this question.)";

export interface InterviewActionResult {
  success: boolean;
  error?: string;
}

/**
 * Resolves both identities every interview action needs: the real
 * signed-in user (rate limiting always applies to the real account, so a
 * manager can't multiply their AI quota by running separate interviews
 * per managed profile) and the active profile (whose data is actually
 * being read/written — their own, or one they manage).
 */
async function requireOwnedSession(sessionId: string) {
  const user = await getAuthUser();
  if (!user) return { error: "Not signed in." as const };

  const profileId = await getActiveProfileId();
  if (!profileId) return { error: "Not signed in." as const };

  const supabase = await createClient();
  const session = await getInterviewSessionById(supabase, sessionId, profileId);
  if (!session) return { error: "Interview session not found." as const };

  return { user, profileId, supabase, session };
}

async function beginNewSession(
  profileId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
  client: NonNullable<ReturnType<typeof getAnthropicClient>>,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const session = await createInterviewSession(supabase, profileId);
  if (!session) {
    return { success: false, error: "Couldn't start the interview." };
  }

  try {
    const turn = await runInterviewTurn({
      client,
      model: getAnthropicModel(),
      history: [],
      latestUserAnswer: null,
    });

    const envelope: AssistantTurnEnvelope = {
      topic: turn.topic,
      completionPercentage: turn.completionPercentage,
      isComplete: turn.isComplete,
      extractedFields: turn.extractedFields,
      giftSuggestion: turn.giftSuggestion,
    };
    const message = await insertInterviewMessage(supabase, {
      sessionId: session.id,
      profileId,
      role: "assistant",
      content: turn.message,
      structuredUpdates: envelope,
    });
    await updateInterviewSession(supabase, session.id, {
      currentTopic: turn.topic,
      completionPercentage: turn.completionPercentage,
    });

    return {
      success: true,
      state: {
        sessionId: session.id,
        status: "in_progress",
        completionPercentage: turn.completionPercentage,
        isComplete: turn.isComplete,
        messages: message ? [toMessageView(message)] : [],
      },
    };
  } catch (error) {
    const message =
      error instanceof AIAssistantError ? error.message : "The AI assistant hit an unexpected error.";
    return { success: false, error: message };
  }
}

/** Starts a new interview session and generates the opening question. */
export async function startInterviewAction(): Promise<
  InterviewActionResult & { state?: InterviewStateView }
> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Not signed in." };

  const profileId = await getActiveProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const client = getAnthropicClient();
  if (!client) {
    return {
      success: false,
      error: "The AI assistant isn't available right now. You can build your profile manually instead.",
    };
  }

  const usage = await checkAndRecordAiUsage({ userId: user.id }, AI_FEATURE_NAME);
  if (!usage.allowed) {
    return { success: false, error: usage.error };
  }

  const supabase = await createClient();
  return beginNewSession(profileId, supabase, client);
}

/**
 * Abandons the current session (if it's still in progress — already-
 * completed sessions are left as historical record) and starts a fresh
 * one. Only the conversation resets: anything already approved into the
 * profile or wishlist stays exactly as it is.
 */
export async function restartInterviewAction(
  currentSessionId: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(currentSessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { user, profileId, supabase, session } = owned;

  const client = getAnthropicClient();
  if (!client) {
    return {
      success: false,
      error: "The AI assistant isn't available right now. You can build your profile manually instead.",
    };
  }

  const usage = await checkAndRecordAiUsage({ userId: user.id }, AI_FEATURE_NAME);
  if (!usage.allowed) {
    return { success: false, error: usage.error };
  }

  if (session.status === "in_progress") {
    await updateInterviewSession(supabase, currentSessionId, { status: "abandoned" });
  }

  return beginNewSession(profileId, supabase, client);
}

async function submitAnswer(
  sessionId: string,
  answerText: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { user, profileId, supabase, session } = owned;

  if (session.status !== "in_progress") {
    return { success: false, error: "This interview has already ended." };
  }

  const client = getAnthropicClient();
  if (!client) {
    return {
      success: false,
      error: "The AI assistant isn't available right now. You can build your profile manually instead.",
    };
  }

  const usage = await checkAndRecordAiUsage({ userId: user.id }, AI_FEATURE_NAME);
  if (!usage.allowed) {
    return { success: false, error: usage.error };
  }

  await insertInterviewMessage(supabase, {
    sessionId,
    profileId,
    role: "user",
    content: answerText,
  });

  const priorRows = await listInterviewMessages(sessionId);
  const history = priorRows
    .slice(0, -1) // exclude the answer we just inserted; sent separately below
    .map((row) => ({ role: row.role, content: row.content }));

  try {
    const turn = await runInterviewTurn({
      client,
      model: getAnthropicModel(),
      history,
      latestUserAnswer: answerText,
    });

    const envelope: AssistantTurnEnvelope = {
      topic: turn.topic,
      completionPercentage: turn.completionPercentage,
      isComplete: turn.isComplete,
      extractedFields: turn.extractedFields,
      giftSuggestion: turn.giftSuggestion,
    };
    await insertInterviewMessage(supabase, {
      sessionId,
      profileId,
      role: "assistant",
      content: turn.message,
      structuredUpdates: envelope,
    });
    await updateInterviewSession(supabase, sessionId, {
      currentTopic: turn.topic,
      completionPercentage: turn.completionPercentage,
    });

    const state = await loadInterviewStateView(sessionId, profileId);
    return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
  } catch (error) {
    const message =
      error instanceof AIAssistantError ? error.message : "The AI assistant hit an unexpected error.";
    return { success: false, error: message };
  }
}

export async function sendInterviewAnswerAction(
  sessionId: string,
  answer: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const trimmed = answer.trim();
  if (!trimmed) return { success: false, error: "Type an answer first." };
  if (trimmed.length > 2000) return { success: false, error: "Keep answers under 2000 characters." };
  return submitAnswer(sessionId, trimmed);
}

export async function skipInterviewQuestionAction(
  sessionId: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  return submitAnswer(sessionId, SKIP_ANSWER_TEXT);
}

/** Deletes the last user+assistant exchange so the user can answer the previous question again. */
export async function goBackInterviewAction(
  sessionId: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { profileId, supabase } = owned;

  const rows = await listInterviewMessages(sessionId);
  if (rows.length <= 1) {
    return { success: false, error: "There's nothing to go back to." };
  }

  const last = rows.at(-1)!;
  const secondLast = rows.at(-2)!;
  const toDelete = [last.id];
  if (secondLast.role === "user") toDelete.push(secondLast.id);

  const deleteError = await deleteInterviewMessages(supabase, toDelete);
  if (deleteError) return { success: false, error: deleteError };

  const remaining = rows.filter((row) => !toDelete.includes(row.id));
  const newLastAssistant = [...remaining].reverse().find((row) => row.role === "assistant");
  const envelope = newLastAssistant?.structured_updates as AssistantTurnEnvelope | null;

  await updateInterviewSession(supabase, sessionId, {
    currentTopic: envelope?.topic ?? null,
    completionPercentage: envelope?.completionPercentage ?? 0,
  });

  const state = await loadInterviewStateView(sessionId, profileId);
  return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
}

function findUnresolvedExtractions(
  rows: Awaited<ReturnType<typeof listInterviewMessages>>,
): { row: (typeof rows)[number]; envelope: AssistantTurnEnvelope }[] {
  const result: { row: (typeof rows)[number]; envelope: AssistantTurnEnvelope }[] = [];
  for (const row of rows) {
    const envelope = row.structured_updates as AssistantTurnEnvelope | null;
    if (envelope?.extractedFields && !envelope.extractionResolution) {
      result.push({ row, envelope });
    }
  }
  return result;
}

/**
 * Applies every profile fact learned across the whole conversation so
 * far in one go — nothing is written per-question; the AI silently
 * tallies facts turn by turn, and this is the single explicit approval
 * point the user acts on (typically at wrap-up).
 */
export async function approveAllExtractedFieldsAction(
  sessionId: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { profileId, supabase } = owned;

  const rows = await listInterviewMessages(sessionId);
  const pending = findUnresolvedExtractions(rows);

  for (const { envelope } of pending) {
    const parsed = interviewExtractionSchema.safeParse(envelope.extractedFields);
    if (!parsed.success) continue; // defensive: skip a malformed turn rather than failing the whole batch
    const applyError = await applyInterviewExtraction(supabase, profileId, parsed.data);
    if (applyError) return { success: false, error: applyError };
  }

  for (const { row, envelope } of pending) {
    await updateMessageEnvelope(supabase, row.id, {
      ...envelope,
      extractionResolution: { applied: true, resolvedAt: new Date().toISOString() },
    });
  }

  const state = await loadInterviewStateView(sessionId, profileId);
  return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
}

/** Declines everything tallied up so far — nothing is written to the profile. */
export async function dismissAllExtractedFieldsAction(
  sessionId: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { profileId, supabase } = owned;

  const rows = await listInterviewMessages(sessionId);
  const pending = findUnresolvedExtractions(rows);

  for (const { row, envelope } of pending) {
    await updateMessageEnvelope(supabase, row.id, {
      ...envelope,
      extractionResolution: { applied: false, resolvedAt: new Date().toISOString() },
    });
  }

  const state = await loadInterviewStateView(sessionId, profileId);
  return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
}

/**
 * Marks a gift-idea proposal as approved or dismissed. The actual
 * wishlist write happens client-side via ProfileContext's addWishlistItem
 * (so the shared wishlist state stays in sync the same way manual adds
 * do) — this action only persists that the card has been resolved, so it
 * doesn't get shown again. Call with applied=true only after the wishlist
 * item was actually added successfully.
 */
export async function resolveGiftSuggestionAction(
  sessionId: string,
  messageId: string,
  applied: boolean,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { profileId, supabase } = owned;

  const rows = await listInterviewMessages(sessionId);
  const target = rows.find((row) => row.id === messageId);
  if (target) {
    const envelope = target.structured_updates as AssistantTurnEnvelope | null;
    if (envelope) {
      await updateMessageEnvelope(supabase, messageId, {
        ...envelope,
        giftSuggestionResolution: { applied, resolvedAt: new Date().toISOString() },
      });
    }
  }

  const state = await loadInterviewStateView(sessionId, profileId);
  return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
}

/** Generates a draft "My Gift Style" summary from already-approved profile facts. Not saved until approved. */
export async function generateGiftStyleSummaryAction(
  sessionId: string,
): Promise<InterviewActionResult & { summary?: string }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { user, profileId, supabase } = owned;

  const client = getAnthropicClient();
  if (!client) {
    return { success: false, error: "The AI assistant isn't available right now." };
  }

  const usage = await checkAndRecordAiUsage({ userId: user.id }, AI_FEATURE_NAME);
  if (!usage.allowed) return { success: false, error: usage.error };

  const chipListDbKeys = SECTION_TS_KEYS.filter((key) => key !== "sizes").map(
    (key) => SECTION_KEY_MAP[key],
  );

  const [{ data: profileRow }, { data: sectionRows }] = await Promise.all([
    supabase.from("profiles").select("introduction").eq("id", profileId).maybeSingle(),
    supabase
      .from("profile_sections")
      .select("section_key, data")
      .eq("profile_id", profileId)
      .in("section_key", chipListDbKeys),
  ]);

  const profileFacts: Record<string, unknown> = {};
  if (profileRow?.introduction) profileFacts.introduction = profileRow.introduction;
  for (const row of sectionRows ?? []) {
    const tsKey = dbKeyToTsKey(row.section_key);
    if (tsKey && Array.isArray(row.data) && row.data.length > 0) {
      profileFacts[tsKey] = row.data;
    }
  }

  try {
    const summary = await generateGiftStyleSummary({
      client,
      model: getAnthropicModel(),
      profileFacts,
    });
    return { success: true, summary };
  } catch (error) {
    const message =
      error instanceof AIAssistantError ? error.message : "The AI assistant hit an unexpected error.";
    return { success: false, error: message };
  }
}

/** Saves the (possibly user-edited) gift style summary and marks the interview complete. */
export async function approveGiftStyleSummaryAction(
  sessionId: string,
  summary: string,
): Promise<InterviewActionResult> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { profileId, supabase } = owned;

  const trimmed = summary.trim();
  if (!trimmed || trimmed.length > 300) {
    return { success: false, error: "Summary must be 1-300 characters." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ gift_style_summary: trimmed })
    .eq("id", profileId);
  if (error) return { success: false, error: error.message };

  const sessionError = await updateInterviewSession(supabase, sessionId, {
    status: "completed",
    completedAt: new Date().toISOString(),
  });
  return sessionError ? { success: false, error: sessionError } : { success: true };
}

/** Ends the interview without saving a gift style summary. */
export async function finishWithoutSummaryAction(
  sessionId: string,
): Promise<InterviewActionResult> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { supabase } = owned;

  const error = await updateInterviewSession(supabase, sessionId, {
    status: "completed",
    completedAt: new Date().toISOString(),
  });
  return error ? { success: false, error } : { success: true };
}
