"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AmazonSearchLink } from "@/components/public-profile/amazon-search-link";
import { WishlistCardVisual } from "@/components/wishlist/wishlist-card-visual";
import { BUDGET_LABELS, PRIORITY_LABELS } from "@/lib/mock/profile";
import { useProfile } from "@/context/profile-context";
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
  const { uploadWishlistItemImage } = useProfile();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const result = await uploadWishlistItemImage(item.id, file);
      if (!result.success) {
        setError(result.error ?? "Couldn't upload that photo. Try again.");
      }
    } catch {
      setError("Couldn't upload that photo. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="relative">
        <WishlistCardVisual
          name={item.name}
          category={item.category}
          imageUrl={item.imageUrl}
        />
        {!item.imageUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm hover:bg-white disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {uploading ? "Uploading…" : "Add photo"}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
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
