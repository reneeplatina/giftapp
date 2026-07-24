import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SessionRow = Database["public"]["Tables"]["ai_interview_sessions"]["Row"];
type MessageRow = Database["public"]["Tables"]["ai_interview_messages"]["Row"];

/**
 * The shape stored in ai_interview_messages.structured_updates for
 * assistant turns — everything needed to reconstruct session state
 * (topic/completion) from message history, plus the extraction proposal
 * and whether the user has resolved it yet.
 */
export interface AssistantTurnEnvelope {
  topic: string;
  completionPercentage: number;
  isComplete: boolean;
  extractedFields?: Record<string, unknown>;
  /** Set once the user approves or dismisses the extraction proposal, if any. */
  extractionResolution?: { applied: boolean; resolvedAt: string };
  giftSuggestion?: Record<string, unknown>;
  /** Set once the user approves or dismisses the gift suggestion, if any — independent of extractionResolution. */
  giftSuggestionResolution?: { applied: boolean; resolvedAt: string };
}

/** Most recent interview session for a profile, regardless of status, or null if none exists yet. */
export async function getLatestInterviewSession(
  profileId: string,
): Promise<SessionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_interview_sessions")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function listInterviewMessages(sessionId: string): Promise<MessageRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_interview_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getInterviewSessionById(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  profileId: string,
): Promise<SessionRow | null> {
  const { data } = await supabase
    .from("ai_interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("profile_id", profileId)
    .maybeSingle();
  return data;
}

export async function createInterviewSession(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<SessionRow | null> {
  const { data } = await supabase
    .from("ai_interview_sessions")
    .insert({ profile_id: profileId })
    .select("*")
    .single();
  return data;
}

export async function insertInterviewMessage(
  supabase: SupabaseClient<Database>,
  params: {
    sessionId: string;
    profileId: string;
    role: "user" | "assistant";
    content: string;
    structuredUpdates?: AssistantTurnEnvelope | null;
  },
): Promise<MessageRow | null> {
  const { data } = await supabase
    .from("ai_interview_messages")
    .insert({
      session_id: params.sessionId,
      profile_id: params.profileId,
      role: params.role,
      content: params.content,
      structured_updates: (params.structuredUpdates ?? null) as unknown as Database["public"]["Tables"]["ai_interview_messages"]["Insert"]["structured_updates"],
    })
    .select("*")
    .single();
  return data;
}

export async function updateMessageEnvelope(
  supabase: SupabaseClient<Database>,
  messageId: string,
  envelope: AssistantTurnEnvelope,
): Promise<string | null> {
  const { error } = await supabase
    .from("ai_interview_messages")
    .update({
      structured_updates: envelope as unknown as Database["public"]["Tables"]["ai_interview_messages"]["Update"]["structured_updates"],
    })
    .eq("id", messageId);
  return error?.message ?? null;
}

export async function deleteInterviewMessages(
  supabase: SupabaseClient<Database>,
  messageIds: string[],
): Promise<string | null> {
  if (messageIds.length === 0) return null;
  const { error } = await supabase.from("ai_interview_messages").delete().in("id", messageIds);
  return error?.message ?? null;
}

export async function updateInterviewSession(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  patch: {
    currentTopic?: string | null;
    completionPercentage?: number;
    status?: "in_progress" | "completed" | "abandoned";
    completedAt?: string | null;
  },
): Promise<string | null> {
  const { error } = await supabase
    .from("ai_interview_sessions")
    .update({
      ...(patch.currentTopic !== undefined && { current_topic: patch.currentTopic }),
      ...(patch.completionPercentage !== undefined && {
        completion_percentage: patch.completionPercentage,
      }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.completedAt !== undefined && { completed_at: patch.completedAt }),
    })
    .eq("id", sessionId);
  return error?.message ?? null;
}
