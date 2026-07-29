import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Sends a single email via Resend's HTTP API. Server-only — RESEND_API_KEY
 * must never reach a client bundle. Returns false (rather than throwing) on
 * any failure, so a batch job (e.g. the wishlist-nudge cron) can log and
 * move on to the next recipient instead of aborting the whole run.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
