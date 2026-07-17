import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Returns the current authenticated user, or null. Always calls
 * getUser() (never getSession()) — per Supabase's guidance, getUser()
 * revalidates the token against the Auth server, while getSession()
 * only trusts the cookie, which is not safe to rely on server-side.
 * Memoized per request with React's cache().
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Use in protected Server Components/pages. Redirects to /login
 * (preserving the originally-requested path) if there's no valid
 * session. This is a second, authoritative check — proxy.ts already do
 * an optimistic redirect, but per Next.js's own guidance, layouts don't
 * re-render on client-side navigation, so this must also be checked
 * close to the actual page/data.
 */
export async function requireAuthUser(currentPath?: string) {
  const user = await getAuthUser();
  if (!user) {
    const params = currentPath
      ? `?redirect=${encodeURIComponent(currentPath)}`
      : "";
    redirect(`/login${params}`);
  }
  return user;
}

/**
 * Fetches the signed-in user's own profile row. RLS already guarantees
 * this can only ever return their own row (or null if they haven't
 * created one yet), regardless of what's passed in — there is no id
 * parameter because there's nothing to parameterize.
 */
export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data;
});
