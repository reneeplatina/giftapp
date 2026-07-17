"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  function onSubmit() {
    router.push("/dashboard");
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
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-neutral-600 underline hover:text-neutral-900"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            Sign in
          </Button>
          <p className="text-center text-xs text-neutral-500">
            Preview only — sign-in isn&apos;t connected yet. This will take
            you to a sample dashboard.
          </p>
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
