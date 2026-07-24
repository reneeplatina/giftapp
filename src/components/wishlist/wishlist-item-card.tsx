import { Gift, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AmazonSearchLink } from "@/components/public-profile/amazon-search-link";
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            <Gift className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-neutral-900">{item.name}</p>
            {item.description && (
              <p className="mt-0.5 text-sm text-neutral-600">
                {item.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${item.name}`}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Remove ${item.name}`}
            className="rounded-full p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant={PRIORITY_VARIANT[item.priority]}>
          {PRIORITY_LABELS[item.priority]}
        </Badge>
        <Badge variant="outline">{BUDGET_LABELS[item.budgetLevel]}</Badge>
        <Badge variant="outline">{item.category}</Badge>
        {!item.isPublic && <Badge variant="outline">Private</Badge>}
      </div>
      <AmazonSearchLink itemName={item.name} />
    </Card>
  );
}
