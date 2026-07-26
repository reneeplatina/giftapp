import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileExists } from "@/lib/profile/ensure-profile";

/**
 * Handles every Supabase auth email link: signup confirmation and
 * password recovery both land here with a token_hash + type, per
 * Supabase's current recommended Next.js SSR pattern.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/onboarding";

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      `${origin}/login?error=invalid_link`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    const fallback = type === "recovery" ? "/forgot-password" : "/signup";
    return NextResponse.redirect(
      `${origin}${fallback}?error=expired_link`,
    );
  }

  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  if (data.user) {
    await ensureProfileExists(data.user);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
