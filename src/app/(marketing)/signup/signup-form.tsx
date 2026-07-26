"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Sparkles, TriangleAlert } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { OtpVerifyForm } from "@/components/auth/otp-verify-form";
import {
  resendConfirmationAction,
  signUpAction,
  verifySignupOtpAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = { status: "idle" };

export function SignupForm({
  exchangeToken,
  exchangeInfo,
  linkError,
}: {
  exchangeToken?: string;
  exchangeInfo: {
    valid: boolean;
    status: string;
    sourceDisplayName: string | null;
  } | null;
  linkError?: string;
}) {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState,
  );

  if (state.status === "needs_confirmation" && state.email) {
    return (
      <OtpVerifyForm
        email={state.email}
        title="Confirm your email"
        description="Enter the code we sent to"
        submitLabel="Confirm email"
        verifyAction={verifySignupOtpAction}
        resendAction={resendConfirmationAction}
      />
    );
  }

  return (
    <Container className="flex flex-1 flex-col justify-center py-12 sm:py-20">
      <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Create your gift profile
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          It&apos;s free — no payment or shopping account required.
        </p>

        {exchangeToken && exchangeInfo?.valid && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-cream px-4 py-3">
            <Sparkles
              className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700"
              aria-hidden="true"
            />
            <p className="text-sm text-neutral-700">
              You&apos;re signing up from{" "}
              <strong>{exchangeInfo.sourceDisplayName}</strong>&apos;s gift
              exchange invite. Once you&apos;re signed up, you can build your
              own profile and send it back to them.
            </p>
          </div>
        )}
        {exchangeToken && !exchangeInfo?.valid && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <p className="text-sm text-amber-800">
              {exchangeInfo?.status === "cancelled"
                ? "That gift exchange invite has been cancelled, but you're welcome to create your own profile anyway."
                : "That gift exchange link isn't valid anymore, but you're welcome to create your own profile anyway."}
            </p>
          </div>
        )}
        {linkError === "expired_link" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <p className="text-sm text-amber-800">
              That confirmation link expired or was already used. Sign up
              again below to get a new one.
            </p>
          </div>
        )}

        <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
          {exchangeToken && (
            <input type="hidden" name="exchangeToken" value={exchangeToken} />
          )}
          <TextField
            label="Your name"
            name="displayName"
            autoComplete="name"
            error={state.fieldErrors?.displayName?.[0]}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            error={state.fieldErrors?.email?.[0]}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
            error={state.fieldErrors?.password?.[0]}
          />
          <TextField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={state.fieldErrors?.confirmPassword?.[0]}
          />
          {state.status === "error" && state.message && (
            <p className="text-sm text-red-600" role="alert">
              {state.message}
            </p>
          )}
          <Button type="submit" disabled={pending} className="mt-2">
            Create my free profile
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have a profile?{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline">
            Sign in
          </Link>
        </p>
      </Card>
    </Container>
  );
}
