"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(values: ForgotPasswordValues) {
    setSubmittedEmail(values.email);
  }

  return (
    <Container className="flex flex-1 flex-col justify-center py-12 sm:py-20">
      <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
        {submittedEmail ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <MailCheck className="h-8 w-8 text-neutral-700" aria-hidden="true" />
            <h1 className="font-display text-2xl font-semibold text-neutral-900">
              Check your email
            </h1>
            <p className="text-sm text-neutral-600">
              If this were connected to a real account, we&apos;d send a
              password reset link to <strong>{submittedEmail}</strong>.
            </p>
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
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 flex flex-col gap-4"
              noValidate
            >
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Button type="submit" disabled={isSubmitting} className="mt-2">
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
