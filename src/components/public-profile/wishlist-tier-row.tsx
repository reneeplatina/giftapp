"use client";

import { useEffect, useRef, useState } from "react";
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
  const [canScroll, setCanScroll] = useState(false);
  const [thumb, setThumb] = useState({ width: 100, left: 0 });

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflowing = scrollWidth > clientWidth + 1;
    setCanScroll(overflowing);
    if (!overflowing) {
      setThumb({ width: 100, left: 0 });
      return;
    }
    const width = Math.max((clientWidth / scrollWidth) * 100, 15);
    const left = (scrollLeft / (scrollWidth - clientWidth)) * (100 - width);
    setThumb({ width, left });
  }

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [items]);

  function scrollNext() {
    scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
        {canScroll && (
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
      {canScroll && (
        <div
          role="presentation"
          className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
        >
          <div
            className="h-full rounded-full bg-neutral-900"
            style={{ width: `${thumb.width}%`, marginLeft: `${thumb.left}%` }}
          />
        </div>
      )}
    </div>
  );
}
