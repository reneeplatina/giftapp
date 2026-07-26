import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Fallback if AI_DAILY_USER_LIMIT isn't set — keeps the assistant usable
 * but bounded (docs/AI_SAFETY.md: guards against a runaway bug/loop, not
 * meant to gate normal use). At today's low per-call cost (Haiku) and
 * this app's current single-user scale, 200/day is still a real ceiling
 * but generous enough that normal use — even several full conversations,
 * restarts, and experimentation in one day — shouldn't come close to it.
 */
const DEFAULT_DAILY_USER_LIMIT = 200;

/** Fallback if AI_DAILY_GUEST_LIMIT isn't set — anonymous visitors get a tighter cap than signed-in owners, per docs/AI_SAFETY.md. */
const DEFAULT_DAILY_GUEST_LIMIT = 20;

function getDailyLimit(kind: "user" | "guest"): number {
  const envVar = kind === "user" ? "AI_DAILY_USER_LIMIT" : "AI_DAILY_GUEST_LIMIT";
  const fallback = kind === "user" ? DEFAULT_DAILY_USER_LIMIT : DEFAULT_DAILY_GUEST_LIMIT;
  const raw = Number(process.env[envVar]);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function startOfTodayUtc(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

export interface UsageCheckResult {
  allowed: boolean;
  error?: string;
}

export type AiUsageIdentity = { userId: string } | { anonymousHash: string };

/**
 * Checks a caller's daily AI usage and, if allowed, records this call.
 * Signed-in users are metered against AI_DAILY_USER_LIMIT; anonymous
 * visitors (identified by a server-issued, hashed guest cookie — see
 * src/lib/ai/guest-identity.ts — never a client-supplied identifier) get
 * the separate, tighter AI_DAILY_GUEST_LIMIT (docs/AI_SAFETY.md). Uses
 * the service-role client because ai_usage_events has no client-facing
 * RLS policies at all (supabase/migrations/20260717000009_ai_usage_events.sql)
 * — it's written only by trusted server code. Fails closed: if the limit
 * can't be checked, the AI feature is refused rather than left unmetered.
 */
export async function checkAndRecordAiUsage(
  identity: AiUsageIdentity,
  featureName: string,
): Promise<UsageCheckResult> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { allowed: false, error: "The AI assistant isn't configured on this deployment." };
  }

  const column = "userId" in identity ? "user_id" : "anonymous_session_hash";
  const value = "userId" in identity ? identity.userId : identity.anonymousHash;
  const limit = getDailyLimit("userId" in identity ? "user" : "guest");

  const { count, error: countError } = await supabase
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .eq(column, value)
    .gte("created_at", startOfTodayUtc());

  if (countError) {
    return { allowed: false, error: "Couldn't verify your AI usage limit right now." };
  }

  if ((count ?? 0) >= limit) {
    return {
      allowed: false,
      error:
        "You've reached today's AI usage limit. Everything still works without it — the AI assistant will be available again tomorrow.",
    };
  }

  const { error: insertError } = await supabase.from("ai_usage_events").insert(
    "userId" in identity
      ? { user_id: identity.userId, feature_name: featureName }
      : { anonymous_session_hash: identity.anonymousHash, feature_name: featureName },
  );

  if (insertError) {
    return { allowed: false, error: "Couldn't record AI usage right now." };
  }

  return { allowed: true };
}
