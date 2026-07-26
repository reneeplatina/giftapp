/**
 * Absolute site URL used for auth email redirect links (confirmation,
 * password reset). Supabase requires an absolute URL here — it can't
 * infer one from the incoming request.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
