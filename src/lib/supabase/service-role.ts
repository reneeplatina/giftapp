import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client — bypasses Row Level Security. Only ever
 * used for `ai_usage_events`, which has no client policies at all by
 * design (see supabase/migrations/20260717000009_ai_usage_events.sql).
 * Never use this client for any other table; every other table must go
 * through the per-request RLS-scoped client in `@/lib/supabase/server`.
 *
 * Returns null (rather than throwing) when the key isn't configured, so
 * callers can fail the AI feature gracefully instead of crashing the app.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
