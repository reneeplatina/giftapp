import { cn } from "@/lib/utils";

const STEPS = [
  "Create your profile",
  "Add your wishlist items — using AI is optional",
  "Share your link with the gifter",
];

export function HowItWorks({ className }: { className?: string }) {
  return (
    <ol className={cn("flex flex-col gap-1.5", className)}>
      {STEPS.map((step, index) => (
        <li key={step} className="flex items-start gap-2 text-sm text-neutral-700">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
            {index + 1}
          </span>
          <span className="pt-px">{step}</span>
        </li>
      ))}
    </ol>
  );
}
