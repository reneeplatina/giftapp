import { z } from "zod";

export const signupSchema = z
  .object({
    displayName: z.string().min(1, "Enter your name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  // Supabase's configured OTP token length isn't fixed at 6 digits (it's
  // a per-project setting), so this only checks it's a plausible numeric
  // code and leaves the real validation to verifyOtp() server-side.
  code: z
    .string()
    .trim()
    .regex(/^\d{4,12}$/, "Enter the code from your email"),
});

export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
