"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileExists } from "@/lib/profile/ensure-profile";
import { getSiteUrl } from "@/lib/site-url";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";

export interface AuthActionState {
  status:
    | "idle"
    | "error"
    | "needs_confirmation"
    | "reset_email_sent"
    | "password_updated";
  message?: string;
  fieldErrors?: Record<string, string[]>;
  email?: string;
}

const GENERIC_ERROR =
  "Something went wrong on our end. Please try again in a moment.";
const NETWORK_ERROR =
  "We couldn't reach the server. Check your connection and try again.";

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof Error && /fetch failed|network/i.test(error.message))
  );
}

function friendlySignInError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "That email or password doesn't look right.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email before signing in.";
  }
  return message || GENERIC_ERROR;
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const exchangeToken = formData.get("exchangeToken");
  const { displayName, email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          exchange_token:
            typeof exchangeToken === "string" && exchangeToken
              ? exchangeToken
              : null,
        },
        emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/onboarding`,
      },
    });

    if (error) {
      return { status: "error", message: error.message || GENERIC_ERROR };
    }

    // Supabase's documented signal for "this email already has an
    // account": signUp() succeeds (to avoid leaking account existence)
    // but returns an empty identities array instead of an error.
    if (data.user && data.user.identities?.length === 0) {
      return {
        status: "error",
        message:
          "That email may already have an account. Try signing in, or reset your password if you've forgotten it.",
      };
    }

    if (data.session && data.user) {
      await ensureProfileExists(data.user);
      redirect("/onboarding");
    }

    return { status: "needs_confirmation", email };
  } catch (error) {
    if (isNetworkError(error)) {
      return { status: "error", message: NETWORK_ERROR };
    }
    throw error;
  }
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const redirectPath = formData.get("redirect");
  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (/email not confirmed/i.test(error.message)) {
        return { status: "needs_confirmation", email };
      }
      return { status: "error", message: friendlySignInError(error.message) };
    }

    if (data.user) {
      await ensureProfileExists(data.user);
    }

    const safeRedirect =
      typeof redirectPath === "string" && redirectPath.startsWith("/")
        ? redirectPath
        : "/dashboard";
    redirect(safeRedirect);
  } catch (error) {
    if (isNetworkError(error)) {
      return { status: "error", message: NETWORK_ERROR };
    }
    throw error;
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Always report the same outcome regardless of whether the email is
  // registered — never confirm or deny account existence here.
  const successState: AuthActionState = {
    status: "reset_email_sent",
    message:
      "If an account exists for that email, we've sent a password reset link.",
  };

  try {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${getSiteUrl()}/auth/confirm?next=/reset-password`,
    });
    return successState;
  } catch (error) {
    if (isNetworkError(error)) {
      return { status: "error", message: NETWORK_ERROR };
    }
    // Any other failure is still reported as the generic success message
    // — a Supabase-side error here must not leak whether the email exists.
    return successState;
  }
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return {
        status: "error",
        message:
          /session|expired|token/i.test(error.message)
            ? "This reset link has expired. Request a new one below."
            : error.message || GENERIC_ERROR,
      };
    }

    redirect("/dashboard");
  } catch (error) {
    if (isNetworkError(error)) {
      return { status: "error", message: NETWORK_ERROR };
    }
    throw error;
  }
}

export async function resendConfirmationAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) {
    return { status: "error", message: GENERIC_ERROR };
  }

  try {
    const supabase = await createClient();
    await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/onboarding`,
      },
    });
    return {
      status: "needs_confirmation",
      email,
      message: "Confirmation email resent — check your inbox.",
    };
  } catch (error) {
    if (isNetworkError(error)) {
      return { status: "error", message: NETWORK_ERROR };
    }
    throw error;
  }
}
