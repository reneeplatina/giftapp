"use server";

import { getAuthUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, getAnthropicModel } from "@/lib/ai/client";
import { AIInterviewError } from "@/lib/ai/errors";
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
import {
  interviewExtractionSchema,
  type InterviewExtraction,
} from "@/lib/validation/ai-interview";

const AI_FEATURE_NAME = "ai_interview";
const SKIP_ANSWER_TEXT = "(I'd like to skip this question.)";

export interface InterviewActionResult {
  success: boolean;
  error?: string;
}

async function requireOwnedSession(sessionId: string) {
  const user = await getAuthUser();
  if (!user) return { error: "Not signed in." as const };

  const supabase = await createClient();
  const session = await getInterviewSessionById(supabase, sessionId, user.id);
  if (!session) return { error: "Interview session not found." as const };

  return { user, supabase, session };
}

/** Starts a new interview session and generates the opening question. */
export async function startInterviewAction(): Promise<
  InterviewActionResult & { state?: InterviewStateView }
> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Not signed in." };

  const client = getAnthropicClient();
  if (!client) {
    return {
      success: false,
      error: "The AI assistant isn't available right now. You can build your profile manually instead.",
    };
  }

  const usage = await checkAndRecordAiUsage(user.id, AI_FEATURE_NAME);
  if (!usage.allowed) {
    return { success: false, error: usage.error };
  }

  const supabase = await createClient();
  const session = await createInterviewSession(supabase, user.id);
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
    };
    const message = await insertInterviewMessage(supabase, {
      sessionId: session.id,
      profileId: user.id,
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
      error instanceof AIInterviewError ? error.message : "The AI assistant hit an unexpected error.";
    return { success: false, error: message };
  }
}

async function submitAnswer(
  sessionId: string,
  answerText: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { user, supabase, session } = owned;

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

  const usage = await checkAndRecordAiUsage(user.id, AI_FEATURE_NAME);
  if (!usage.allowed) {
    return { success: false, error: usage.error };
  }

  await insertInterviewMessage(supabase, {
    sessionId,
    profileId: user.id,
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
    };
    await insertInterviewMessage(supabase, {
      sessionId,
      profileId: user.id,
      role: "assistant",
      content: turn.message,
      structuredUpdates: envelope,
    });
    await updateInterviewSession(supabase, sessionId, {
      currentTopic: turn.topic,
      completionPercentage: turn.completionPercentage,
    });

    const state = await loadInterviewStateView(sessionId, user.id);
    return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
  } catch (error) {
    const message =
      error instanceof AIInterviewError ? error.message : "The AI assistant hit an unexpected error.";
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
  const { user, supabase } = owned;

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

  const state = await loadInterviewStateView(sessionId, user.id);
  return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
}

/** Applies an (optionally user-edited) extraction proposal to the profile. Requires explicit approval — never called automatically. */
export async function approveExtractedFieldsAction(
  sessionId: string,
  messageId: string,
  fields: InterviewExtraction,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { user, supabase } = owned;

  const parsed = interviewExtractionSchema.safeParse(fields);
  if (!parsed.success) {
    return { success: false, error: "Those changes weren't in the expected format." };
  }

  const applyError = await applyInterviewExtraction(supabase, user.id, parsed.data);
  if (applyError) return { success: false, error: applyError };

  const rows = await listInterviewMessages(sessionId);
  const target = rows.find((row) => row.id === messageId);
  if (target) {
    const envelope = target.structured_updates as AssistantTurnEnvelope | null;
    if (envelope) {
      await updateMessageEnvelope(supabase, messageId, {
        ...envelope,
        resolution: { applied: true, resolvedAt: new Date().toISOString() },
      });
    }
  }

  const state = await loadInterviewStateView(sessionId, user.id);
  return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
}

/** Declines an extraction proposal — nothing is written to the profile. */
export async function dismissExtractedFieldsAction(
  sessionId: string,
  messageId: string,
): Promise<InterviewActionResult & { state?: InterviewStateView }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { user, supabase } = owned;

  const rows = await listInterviewMessages(sessionId);
  const target = rows.find((row) => row.id === messageId);
  if (target) {
    const envelope = target.structured_updates as AssistantTurnEnvelope | null;
    if (envelope) {
      await updateMessageEnvelope(supabase, messageId, {
        ...envelope,
        resolution: { applied: false, resolvedAt: new Date().toISOString() },
      });
    }
  }

  const state = await loadInterviewStateView(sessionId, user.id);
  return state ? { success: true, state } : { success: false, error: "Couldn't load the interview." };
}

/** Generates a draft "My Gift Style" summary from already-approved profile facts. Not saved until approved. */
export async function generateGiftStyleSummaryAction(
  sessionId: string,
): Promise<InterviewActionResult & { summary?: string }> {
  const owned = await requireOwnedSession(sessionId);
  if ("error" in owned) return { success: false, error: owned.error };
  const { user, supabase } = owned;

  const client = getAnthropicClient();
  if (!client) {
    return { success: false, error: "The AI assistant isn't available right now." };
  }

  const usage = await checkAndRecordAiUsage(user.id, AI_FEATURE_NAME);
  if (!usage.allowed) return { success: false, error: usage.error };

  const chipListDbKeys = SECTION_TS_KEYS.filter((key) => key !== "sizes").map(
    (key) => SECTION_KEY_MAP[key],
  );

  const [{ data: profileRow }, { data: sectionRows }] = await Promise.all([
    supabase.from("profiles").select("introduction").eq("id", user.id).maybeSingle(),
    supabase
      .from("profile_sections")
      .select("section_key, data")
      .eq("profile_id", user.id)
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
      error instanceof AIInterviewError ? error.message : "The AI assistant hit an unexpected error.";
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
  const { user, supabase } = owned;

  const trimmed = summary.trim();
  if (!trimmed || trimmed.length > 300) {
    return { success: false, error: "Summary must be 1-300 characters." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ gift_style_summary: trimmed })
    .eq("id", user.id);
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
