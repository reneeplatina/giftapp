"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuthUser } from "@/lib/auth/dal";
import { sendEmail } from "@/lib/notifications/resend";
import { ADMIN_EMAIL } from "@/lib/admin";
import { feedbackSchema } from "@/lib/validation/feedback";

export interface FeedbackActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitFeedbackAction(
  _prevState: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const user = await requireAuthUser("/feedback");

  const parsed = feedbackSchema.safeParse({
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("feedback").insert({
    profile_id: user.id,
    message: parsed.data.message,
  });

  if (error) {
    return {
      status: "error",
      message: "Couldn't send that. Please try again in a moment.",
    };
  }

  // Best-effort: the feedback is already saved regardless of whether
  // this notification goes through.
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: "New GiftMe feedback",
    html: `<p><strong>${user.email ?? "Someone"}</strong> sent feedback:</p>
<p>${parsed.data.message.replace(/\n/g, "<br />")}</p>`,
  });

  return { status: "success", message: "Thanks — we read every note." };
}
