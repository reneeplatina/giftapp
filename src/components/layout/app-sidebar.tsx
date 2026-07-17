"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift } from "lucide-react";
import { APP_NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-cream/40 md:flex md:flex-col">
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-6 font-display text-lg font-semibold text-neutral-900"
      >
        <Gift className="h-5 w-5" aria-hidden="true" />
        Gift Profile
      </Link>
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-3">
        {APP_NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-6 text-xs text-neutral-500">
        Free forever. No ads, no payments.
      </div>
    </aside>
  );
}
