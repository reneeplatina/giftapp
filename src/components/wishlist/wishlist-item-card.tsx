import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductSearchLinks } from "@/components/public-profile/product-search-links";
import { WishlistCardVisual } from "@/components/wishlist/wishlist-card-visual";
import { BUDGET_LABELS, PRIORITY_LABELS } from "@/lib/mock/profile";
import type { PriorityLevel, WishlistItem } from "@/types/profile";

const PRIORITY_VARIANT: Record<PriorityLevel, "neutral" | "warning" | "outline"> = {
  dream_gift: "neutral",
  would_love: "warning",
  nice_to_have: "outline",
};

export function WishlistItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: WishlistItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="relative">
        <WishlistCardVisual
          name={item.name}
          category={item.category}
          imageUrl={item.imageUrl}
        />
        <div className="absolute right-1.5 top-1.5 flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${item.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-700 hover:bg-white"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Remove ${item.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
      {item.description && (
        <p className="text-sm text-neutral-600">{item.description}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Badge variant={PRIORITY_VARIANT[item.priority]}>
          {PRIORITY_LABELS[item.priority]}
        </Badge>
        <Badge variant="outline">{BUDGET_LABELS[item.budgetLevel]}</Badge>
        <Badge variant="outline">{item.category}</Badge>
        {item.preferredSize && (
          <Badge variant="outline">Size {item.preferredSize}</Badge>
        )}
        {!item.isPublic && <Badge variant="outline">Private</Badge>}
      </div>
      <ProductSearchLinks itemName={item.name} category={item.category} />
    </Card>
  );
}
