import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sendEmail } from "@/lib/notifications/resend";
import { getSiteUrl } from "@/lib/site-url";

// Only re-nudge a given profile roughly once a day, regardless of exactly
// when in the day the cron job fires.
const MIN_HOURS_BETWEEN_NUDGES = 20;

/**
 * Daily reminder for accounts that signed up but never added anything to
 * their wishlist. Triggered by a Supabase pg_cron job (see the
 * add_profile_nudge_tracking migration) via an HTTP POST carrying a shared
 * secret — this is not a user-facing endpoint.
 *
 * Deliberately excludes managed/linked profiles (managed_by_profile_id set):
 * those are controlled entirely by whoever created them, who already knows
 * whether the wishlist is filled in — there's no separate inbox to nudge.
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

  const cutoff = new Date(Date.now() - MIN_HOURS_BETWEEN_NUDGES * 60 * 60 * 1000).toISOString();

  const { data: candidates, error: candidatesError } = await supabase
    .from("profiles")
    .select("id, display_name, slug")
    .is("managed_by_profile_id", null)
    .eq("nudge_enabled", true)
    .or(`last_nudge_sent_at.is.null,last_nudge_sent_at.lt.${cutoff}`);

  if (candidatesError) {
    return NextResponse.json({ error: candidatesError.message }, { status: 500 });
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  const { data: itemRows } = await supabase
    .from("wishlist_items")
    .select("profile_id")
    .in(
      "profile_id",
      candidates.map((c) => c.id),
    );
  const profilesWithItems = new Set((itemRows ?? []).map((row) => row.profile_id));
  const eligible = candidates.filter((c) => !profilesWithItems.has(c.id));

  let sent = 0;
  const errors: string[] = [];

  for (const profile of eligible) {
    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (!email) {
      errors.push(`${profile.id}: no email on file`);
      continue;
    }

    const wishlistUrl = `${getSiteUrl()}/wishlist`;
    const ok = await sendEmail({
      to: email,
      subject: "Finish setting up your GIFT ME! profile",
      html: `<p>Hi ${profile.display_name || "there"},</p>
<p>Your gift profile is almost ready — you just haven't added anything to your wishlist yet. Once you do, the people who want to get you something will actually know what to pick.</p>
<p><a href="${wishlistUrl}">Add a few gift ideas</a> — it only takes a minute.</p>`,
    });

    await supabase
      .from("profiles")
      .update({ last_nudge_sent_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (ok) {
      sent += 1;
    } else {
      errors.push(`${profile.id}: send failed`);
    }
  }

  return NextResponse.json({
    sent,
    skipped: candidates.length - eligible.length,
    errors,
  });
}
