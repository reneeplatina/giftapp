"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { signupSchema, type SignupValues } from "@/lib/validation/auth";

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  function onSubmit() {
    router.push("/dashboard");
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
          <TextField
            label="Your name"
            autoComplete="name"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            Create my free profile
          </Button>
          <p className="text-center text-xs text-neutral-500">
            Preview only — account creation isn&apos;t connected yet. This
            will take you to a sample dashboard.
          </p>
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
