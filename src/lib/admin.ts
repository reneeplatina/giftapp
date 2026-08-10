import "server-only";

/**
 * The app owner's own account email — used both as the "someone signed
 * up" notification address and to gate the admin-only pages (usage
 * stats, feedback inbox) to just this one account.
 */
export const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "platinarenee@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
