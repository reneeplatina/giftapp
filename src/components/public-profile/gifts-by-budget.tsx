"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AmazonSearchLink } from "@/components/public-profile/amazon-search-link";
import { BUDGET_LABELS } from "@/lib/mock/profile";
import type { BudgetLevel, WishlistItem } from "@/types/profile";

const BUDGET_ORDER: BudgetLevel[] = [
  "under_25",
  "25_to_75",
  "75_to_200",
  "over_200",
];

export function GiftsByBudget({ items }: { items: WishlistItem[] }) {
  const [active, setActive] = useState<BudgetLevel>("under_25");
  const visibleItems = items.filter((item) => item.budgetLevel === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter gift ideas by budget"
        className="flex flex-wrap gap-2"
      >
        {BUDGET_ORDER.map((level) => (
          <button
            key={level}
            type="button"
            role="tab"
            aria-selected={active === level}
            onClick={() => setActive(level)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active === level
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {BUDGET_LABELS[level]}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-4 flex flex-col gap-2">
        {visibleItems.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No gift ideas in this range yet.
          </p>
        ) : (
          visibleItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border border-neutral-200 px-4 py-3"
            >
              <span className="text-sm font-medium text-neutral-900">
                {item.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">{item.category}</span>
                <AmazonSearchLink itemName={item.name} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
