import { cn } from "@/lib/utils";

export function LoadingSkeleton({
  className,
  "aria-label": ariaLabel = "Loading",
}: {
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn("animate-pulse rounded-lg bg-neutral-200", className)}
    />
  );
}
