"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheck, LogIn, TriangleAlert } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import {
  resendConfirmationAction,
  signInAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = { status: "idle" };

export function LoginForm({
  redirectPath,
  linkError,
}: {
  redirectPath?: string;
  linkError?: string;
}) {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialState,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendConfirmationAction,
    initialState,
  );

  const needsConfirmation =
    state.status === "needs_confirmation" ||
    resendState.status === "needs_confirmation";

  if (needsConfirmation) {
    const email = resendState.email ?? state.email;
    return (
      <Container className="flex flex-1 flex-col justify-center py-12 sm:py-20">
        <Card className="mx-auto flex w-full max-w-md flex-col items-center gap-3 p-6 text-center sm:p-8">
          <MailCheck className="h-8 w-8 text-neutral-700" aria-hidden="true" />
          <h1 className="font-display text-2xl font-semibold text-neutral-900">
            Confirm your email first
          </h1>
          <p className="text-sm text-neutral-600">
            We need you to confirm <strong>{email}</strong> before you can
            sign in. Check your inbox for the link.
          </p>
          {resendState.message && (
            <p className="text-sm text-green-700">{resendState.message}</p>
          )}
          <form action={resendAction}>
            <input type="hidden" name="email" value={email} />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={resendPending}
            >
              Resend confirmation email
            </Button>
          </form>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="flex flex-1 flex-col justify-center py-12 sm:py-20">
      <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Welcome back — pick up where you left off.
        </p>

        {redirectPath && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-cream px-4 py-3">
            <LogIn
              className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700"
              aria-hidden="true"
            />
            <p className="text-sm text-neutral-700">
              Please sign in to continue.
            </p>
          </div>
        )}
        {linkError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <p className="text-sm text-amber-800">
              That link isn&apos;t valid or has expired. Please sign in, or
              request a new link below.
            </p>
          </div>
        )}

        <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
          {redirectPath && (
            <input type="hidden" name="redirect" value={redirectPath} />
          )}
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
            autoComplete="current-password"
            error={state.fieldErrors?.password?.[0]}
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-neutral-600 underline hover:text-neutral-900"
            >
              Forgot password?
            </Link>
          </div>
          {state.status === "error" && state.message && (
            <p className="text-sm text-red-600" role="alert">
              {state.message}
            </p>
          )}
          <Button type="submit" disabled={pending} className="mt-2">
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-600">
          Don&apos;t have a profile yet?{" "}
          <Link href="/signup" className="font-medium text-neutral-900 underline">
            Create one
          </Link>
        </p>
      </Card>
    </Container>
  );
}
