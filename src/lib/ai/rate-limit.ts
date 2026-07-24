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

function getDailyUserLimit(): number {
  const raw = Number(process.env.AI_DAILY_USER_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DAILY_USER_LIMIT;
}

function startOfTodayUtc(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

export interface UsageCheckResult {
  allowed: boolean;
  error?: string;
}

/**
 * Checks the signed-in user's daily AI usage against AI_DAILY_USER_LIMIT
 * and, if allowed, records this call. Uses the service-role client
 * because ai_usage_events has no client-facing RLS policies at all (see
 * supabase/migrations/20260717000009_ai_usage_events.sql) — it's written
 * only by trusted server code. Fails closed: if the limit can't be
 * checked, the AI feature is refused rather than left unmetered.
 */
export async function checkAndRecordAiUsage(
  userId: string,
  featureName: string,
): Promise<UsageCheckResult> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { allowed: false, error: "The AI assistant isn't configured on this deployment." };
  }

  const { count, error: countError } = await supabase
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfTodayUtc());

  if (countError) {
    return { allowed: false, error: "Couldn't verify your AI usage limit right now." };
  }

  if ((count ?? 0) >= getDailyUserLimit()) {
    return {
      allowed: false,
      error:
        "You've reached today's AI interview limit. You can keep building your profile manually, and the AI assistant will be available again tomorrow.",
    };
  }

  const { error: insertError } = await supabase
    .from("ai_usage_events")
    .insert({ user_id: userId, feature_name: featureName });

  if (insertError) {
    return { allowed: false, error: "Couldn't record AI usage right now." };
  }

  return { allowed: true };
}
