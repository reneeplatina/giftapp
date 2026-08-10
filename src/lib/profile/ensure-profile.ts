import "server-only";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { generateUniqueSlug } from "@/lib/profile/slug";
import { sendEmail } from "@/lib/notifications/resend";
import { getSiteUrl } from "@/lib/site-url";
import { ADMIN_EMAIL } from "@/lib/admin";

/**
 * Creates the initial (draft) profile row for a freshly-authenticated
 * user if one doesn't already exist yet, emails the app owner that a new
 * signup happened, and — if they arrived through a valid gift-exchange
 * link — claims that exchange request. Safe to call more than once (e.g.
 * on every sign-in): it's a no-op once the profile exists, so the
 * notification only ever fires for the genuine first-time creation.
 *
 * display_name, birthday, and exchange_token travel in the user's own
 * user_metadata (set at signUp time), so this works whether it runs
 * right after signUp() (email confirmation disabled) or later, from the
 * /auth/confirm callback (email confirmation enabled) — either way,
 * `user` here is already a real authenticated session.
 */
export async function ensureProfileExists(user: User) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return;
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Friend";

  const slug = await generateUniqueSlug(supabase, displayName);

  const birthday = (user.user_metadata?.birthday as string | undefined) || null;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    slug,
    display_name: displayName,
    status: "draft",
    birthday,
  });

  if (insertError) {
    throw new Error(`Could not create profile: ${insertError.message}`);
  }

  // Best-effort: this is just an FYI to the app owner, never something
  // that should block or fail a real signup.
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: "New GiftMe signup",
    html: `<p><strong>${displayName}</strong> just signed up${
      user.email ? ` (${user.email})` : ""
    }.</p>
<p><a href="${getSiteUrl()}/u/${slug}">View their profile</a></p>`,
  });

  const exchangeToken = user.user_metadata?.exchange_token as
    | string
    | undefined;

  if (exchangeToken) {
    // Best-effort: an expired/invalid/already-claimed token should never
    // block account or profile creation — the user still gets their
    // account either way.
    await supabase.rpc("claim_exchange_request", { token: exchangeToken });
  }
}
