import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sendEmail } from "@/lib/notifications/resend";
import { getSiteUrl } from "@/lib/site-url";

const REMINDER_DAYS_BEFORE = 7;
// Birthdays repeat annually — this stops the same upcoming birthday from
// re-triggering a reminder every day it happens to still be within the
// window, without needing to track "which year" explicitly.
const MIN_DAYS_BETWEEN_SAME_REMINDER = 300;

/**
 * Daily check for profiles whose birthday is coming up, emailing whoever
 * originally shared their GiftMe link with that person (tracked via
 * gift_exchange_requests) — not every visitor with the link, just the
 * specific person who sent the invite that led to the signup. Triggered
 * by a Supabase pg_cron job via an HTTP POST carrying a shared secret —
 * this is not a user-facing endpoint.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 500 });
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from("profiles")
    .select("id, display_name, slug, birthday, last_birthday_reminder_sent_at")
    .not("birthday", "is", null);

  if (candidatesError) {
    return NextResponse.json({ error: candidatesError.message }, { status: 500 });
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  const today = new Date();
  const reminderCutoff = Date.now() - MIN_DAYS_BETWEEN_SAME_REMINDER * 24 * 60 * 60 * 1000;

  const eligible = candidates.filter((profile) => {
    if (!profile.birthday) return false;
    if (daysUntilNextBirthday(profile.birthday, today) !== REMINDER_DAYS_BEFORE) {
      return false;
    }
    if (profile.last_birthday_reminder_sent_at) {
      const lastSent = new Date(profile.last_birthday_reminder_sent_at).getTime();
      if (lastSent > reminderCutoff) return false;
    }
    return true;
  });

  if (eligible.length === 0) {
    return NextResponse.json({ sent: 0, skipped: candidates.length });
  }

  const { data: exchangeRows } = await supabase
    .from("gift_exchange_requests")
    .select("source_profile_id, referred_user_id")
    .in(
      "referred_user_id",
      eligible.map((profile) => profile.id),
    )
    .in("status", ["started", "completed"]);

  const referrerByProfileId = new Map<string, string>();
  for (const row of exchangeRows ?? []) {
    if (row.referred_user_id && !referrerByProfileId.has(row.referred_user_id)) {
      referrerByProfileId.set(row.referred_user_id, row.source_profile_id);
    }
  }

  let sent = 0;
  const errors: string[] = [];

  for (const profile of eligible) {
    const referrerId = referrerByProfileId.get(profile.id);
    if (!referrerId) continue; // nobody to notify — not referred through a share link

    const { data: userData } = await supabase.auth.admin.getUserById(referrerId);
    const email = userData?.user?.email;
    if (!email) {
      errors.push(`${profile.id}: referrer has no email on file`);
      continue;
    }

    const profileUrl = `${getSiteUrl()}/u/${profile.slug}`;
    const ok = await sendEmail({
      to: email,
      subject: `${profile.display_name}'s birthday is coming up`,
      html: `<p><strong>${profile.display_name}</strong>'s birthday is in ${REMINDER_DAYS_BEFORE} days.</p>
<p><a href="${profileUrl}">Check their gift profile</a> for what they'd love.</p>`,
    });

    await supabase
      .from("profiles")
      .update({ last_birthday_reminder_sent_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (ok) {
      sent += 1;
    } else {
      errors.push(`${profile.id}: send failed`);
    }
  }

  return NextResponse.json({
    sent,
    skipped: candidates.length - sent,
    errors,
  });
}

/** Days from `today` until the next occurrence of a "YYYY-MM-DD" birthday's
 * month/day, wrapping to next year if this year's has already passed.
 * Computed in UTC calendar days, ignoring time-of-day. */
function daysUntilNextBirthday(birthday: string, today: Date): number {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(birthday);
  if (!match) return Infinity;
  const month = Number(match[1]) - 1;
  const day = Number(match[2]);

  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  let next = Date.UTC(today.getUTCFullYear(), month, day);
  if (next < todayUtc) {
    next = Date.UTC(today.getUTCFullYear() + 1, month, day);
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((next - todayUtc) / msPerDay);
}
