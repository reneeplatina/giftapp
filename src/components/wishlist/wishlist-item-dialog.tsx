"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { Toggle } from "@/components/ui/toggle";
import { BUDGET_LABELS, CATEGORY_OPTIONS, PRIORITY_LABELS } from "@/lib/mock/profile";
import { useProfile } from "@/context/profile-context";
import {
  wishlistItemSchema,
  type WishlistItemValues,
} from "@/lib/validation/wishlist";
import type { WishlistItem } from "@/types/profile";

const BUDGET_OPTIONS = Object.entries(BUDGET_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const CATEGORY_SELECT_OPTIONS = CATEGORY_OPTIONS.map((category) => ({
  value: category,
  label: category,
}));

export function WishlistItemDialog({
  open,
  onClose,
  onSubmit,
  initialItem,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: WishlistItemValues) => void;
  initialItem?: WishlistItem;
}) {
  const { uploadWishlistItemImage, removeWishlistItemImage } = useProfile();
  const [imageUrl, setImageUrl] = useState<string | null>(initialItem?.imageUrl ?? null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WishlistItemValues>({
    resolver: zodResolver(wishlistItemSchema),
    defaultValues: initialItem ?? {
      name: "",
      description: "",
      category: CATEGORY_OPTIONS[0],
      budgetLevel: "under_25",
      priority: "would_love",
      isPublic: true,
    },
  });

  const hasReset = useRef(false);
  useEffect(() => {
    if (open && !hasReset.current) {
      reset(
        initialItem ?? {
          name: "",
          description: "",
          category: CATEGORY_OPTIONS[0],
          budgetLevel: "under_25",
          priority: "would_love",
          isPublic: true,
        },
      );
      setImageUrl(initialItem?.imageUrl ?? null);
      setImageError(null);
      hasReset.current = true;
    }
    if (!open) {
      hasReset.current = false;
    }
  }, [open, initialItem, reset]);

  function submit(values: WishlistItemValues) {
    onSubmit(values);
    onClose();
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !initialItem) return;

    setImageError(null);
    setImageUploading(true);
    try {
      const result = await uploadWishlistItemImage(initialItem.id, file);
      if (!result.success || !result.item) {
        setImageError(result.error ?? "Couldn't upload that photo. Try again.");
        return;
      }
      setImageUrl(result.item.imageUrl);
    } catch {
      setImageError("Couldn't upload that photo. Try again.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleImageRemove() {
    if (!initialItem) return;
    setImageError(null);
    const result = await removeWishlistItemImage(initialItem.id);
    if (!result.success) {
      setImageError(result.error ?? "Couldn't remove that photo.");
      return;
    }
    setImageUrl(null);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialItem ? "Edit wishlist item" : "Add a wishlist item"}
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        {initialItem ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-neutral-700">Photo</span>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-neutral-400">
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  )}
                  {imageUrl ? "Replace photo" : "Add photo"}
                </Button>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            {imageError && (
              <p className="text-sm text-red-600" role="alert">
                {imageError}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            You can add a photo once you&apos;ve saved this item.
          </p>
        )}
        <TextField
          label="Item name"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextAreaField
          label="Notes"
          hint="Preferred color, size, or details that help a gift-giver."
          error={errors.description?.message}
          {...register("description")}
        />
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Category"
            options={CATEGORY_SELECT_OPTIONS}
            error={errors.category?.message}
            {...register("category")}
          />
          <SelectField
            label="Budget"
            options={BUDGET_OPTIONS}
            error={errors.budgetLevel?.message}
            {...register("budgetLevel")}
          />
        </div>
        <SelectField
          label="Priority"
          options={PRIORITY_OPTIONS}
          error={errors.priority?.message}
          {...register("priority")}
        />
        <Toggle
          label="Show on public profile"
          description="Visitors can see this item and help fulfill it."
          {...register("isPublic")}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialItem ? "Save changes" : "Add item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
