import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-neutral-400" aria-hidden="true" />
      <p className="font-display text-lg font-semibold text-neutral-900">
        {title}
      </p>
      <p className="max-w-sm text-sm text-neutral-500">{description}</p>
      {children}
    </div>
  );
}
