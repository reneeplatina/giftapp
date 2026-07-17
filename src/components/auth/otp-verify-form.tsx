"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import type { AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { status: "idle" };

export function OtpVerifyForm({
  email,
  title,
  description,
  submitLabel,
  verifyAction,
  resendAction,
}: {
  email: string;
  title: string;
  description: string;
  submitLabel: string;
  verifyAction: (
    prevState: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  resendAction: (
    prevState: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
}) {
  const [state, formAction, pending] = useActionState(
    verifyAction,
    initialState,
  );
  const [resendState, resendFormAction, resendPending] = useActionState(
    resendAction,
    initialState,
  );

  return (
    <Container className="flex flex-1 flex-col justify-center py-12 sm:py-20">
      <Card className="mx-auto flex w-full max-w-md flex-col items-center gap-3 p-6 text-center sm:p-8">
        <ShieldCheck className="h-8 w-8 text-neutral-700" aria-hidden="true" />
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          {title}
        </h1>
        <p className="text-sm text-neutral-600">
          {description} <strong>{email}</strong>
        </p>

        <form
          action={formAction}
          className="mt-2 flex w-full flex-col gap-4"
          noValidate
        >
          <input type="hidden" name="email" value={email} />
          <TextField
            label="6-digit code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            error={state.fieldErrors?.code?.[0]}
          />
          {state.status === "error" && state.message && (
            <p className="text-sm text-red-600" role="alert">
              {state.message}
            </p>
          )}
          <Button type="submit" disabled={pending} className="mt-1">
            {submitLabel}
          </Button>
        </form>

        <form action={resendFormAction} className="mt-1">
          <input type="hidden" name="email" value={email} />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={resendPending}
          >
            Resend code
          </Button>
        </form>
        {resendState.message && (
          <p className="text-sm text-green-700">{resendState.message}</p>
        )}

        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-neutral-900 underline"
        >
          Back to sign in
        </Link>
      </Card>
    </Container>
  );
}
