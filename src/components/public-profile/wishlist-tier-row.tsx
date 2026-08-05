"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AmazonSearchLink } from "@/components/public-profile/amazon-search-link";
import { WishlistCardVisual } from "@/components/wishlist/wishlist-card-visual";
import type { WishlistItem } from "@/types/profile";

export function WishlistTierRow({
  symbol,
  items,
}: {
  symbol: string;
  items: WishlistItem[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollNext() {
    scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <Card
            key={item.id}
            className="flex w-[190px] shrink-0 snap-start flex-col gap-1.5"
          >
            <WishlistCardVisual name={item.name} category={item.category} />
            {item.description && (
              <p className="line-clamp-2 text-sm text-neutral-600">
                {item.description}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="success" className="font-semibold">
                {symbol}
              </Badge>
              {item.category && <Badge variant="outline">{item.category}</Badge>}
              {item.priority === "dream_gift" && (
                <Badge variant="neutral">Dream gift</Badge>
              )}
            </div>
            <AmazonSearchLink itemName={item.name} />
          </Card>
        ))}
      </div>
      {items.length > 1 && (
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Scroll to see more items"
          className="absolute right-1 top-16 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
