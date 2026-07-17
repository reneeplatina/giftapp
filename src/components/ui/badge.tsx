import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "outline";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-900 text-white",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  outline: "border border-neutral-300 text-neutral-700",
};

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className"> {
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
