"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck, TriangleAlert } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import {
  requestPasswordResetAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = { status: "idle" };

export function ForgotPasswordForm({ linkError }: { linkError?: string }) {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <Container className="flex flex-1 flex-col justify-center py-12 sm:py-20">
      <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
        {state.status === "reset_email_sent" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <MailCheck className="h-8 w-8 text-neutral-700" aria-hidden="true" />
            <h1 className="font-display text-2xl font-semibold text-neutral-900">
              Check your email
            </h1>
            <p className="text-sm text-neutral-600">{state.message}</p>
            <Link
              href="/login"
              className="mt-2 text-sm font-medium text-neutral-900 underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-neutral-900">
              Forgot password
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            {linkError === "expired_link" && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <TriangleAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                  aria-hidden="true"
                />
                <p className="text-sm text-amber-800">
                  That reset link expired or was already used. Request a new
                  one below.
                </p>
              </div>
            )}
            <form
              action={formAction}
              className="mt-6 flex flex-col gap-4"
              noValidate
            >
              <TextField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                error={state.fieldErrors?.email?.[0]}
              />
              {state.status === "error" && state.message && (
                <p className="text-sm text-red-600" role="alert">
                  {state.message}
                </p>
              )}
              <Button type="submit" disabled={pending} className="mt-2">
                Send reset link
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-neutral-600">
              <Link href="/login" className="font-medium text-neutral-900 underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </Card>
    </Container>
  );
}
