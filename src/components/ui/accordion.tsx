import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AccordionItem({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: ReactNode;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-base font-medium text-neutral-900">
            {title}
          </span>
          {description && (
            <span className="mt-0.5 block text-sm text-neutral-500">
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="h-5 w-5 shrink-0 text-neutral-500 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-6">{children}</div>
    </details>
  );
}
