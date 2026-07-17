import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only reachable with a session established by clicking a real recovery
  // link (see src/app/auth/confirm/route.ts) — there's nothing to reset
  // otherwise.
  if (!user) {
    redirect("/forgot-password?error=expired_link");
  }

  return <ResetPasswordForm />;
}
