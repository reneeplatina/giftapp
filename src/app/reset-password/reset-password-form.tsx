"use client";

import { useActionState } from "react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { updatePasswordAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { status: "idle" };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <Container className="flex flex-1 flex-col justify-center py-12 sm:py-20">
      <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Choose a new password
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Enter a new password for your account.
        </p>
        <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
          <TextField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
            error={state.fieldErrors?.password?.[0]}
          />
          <TextField
            label="Confirm new password"
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
            Update password
          </Button>
        </form>
      </Card>
    </Container>
  );
}
