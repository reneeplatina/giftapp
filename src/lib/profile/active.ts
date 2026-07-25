import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/dal";

export const ACTIVE_PROFILE_COOKIE = "giftapp_active_profile";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export function activeProfileCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE_SECONDS,
    path: "/",
  };
}

/**
 * Resolves which profile the signed-in user is currently acting as —
 * their own, or one they manage (profiles.managed_by_profile_id). This
 * IS the authorization check every profile-mutating action and DAL
 * function relies on: it falls back to the caller's own id whenever the
 * cookie is missing, malformed, or names a profile they no longer
 * manage, so nothing downstream needs to re-check ownership itself.
 * Memoized per request with React's cache().
 */
export const getActiveProfileId = cache(async (): Promise<string | null> => {
  const user = await getAuthUser();
  if (!user) return null;

  const store = await cookies();
  const requested = store.get(ACTIVE_PROFILE_COOKIE)?.value;
  if (!requested || requested === user.id) return user.id;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", requested)
    .eq("managed_by_profile_id", user.id)
    .maybeSingle();

  return data?.id ?? user.id;
});
