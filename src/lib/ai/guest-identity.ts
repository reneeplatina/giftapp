import "server-only";

import { randomUUID, createHash } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "giftapp_guest_id";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

/**
 * Identifies an anonymous visitor for AI rate limiting, without trusting
 * anything the client supplies (docs/AI_SAFETY.md: "tracked server-side,
 * not by trusting client-supplied identifiers"). Issues a random,
 * httpOnly cookie on first use if none exists, then returns a SHA-256
 * hash of it — the raw token never leaves this function or touches the
 * database; only the hash is stored in ai_usage_events.anonymous_session_hash.
 */
export async function getOrCreateGuestHash(): Promise<string> {
  const store = await cookies();
  let token = store.get(COOKIE_NAME)?.value;

  if (!token) {
    token = randomUUID();
    store.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
  }

  return createHash("sha256").update(token).digest("hex");
}
