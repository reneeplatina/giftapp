"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useProfile } from "@/context/profile-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { Toggle } from "@/components/ui/toggle";
import { BUDGET_LABELS, CATEGORY_OPTIONS, PRIORITY_LABELS } from "@/lib/mock/profile";
import { guessSizeType } from "@/lib/wishlist/guess-size-type";
import {
  wishlistItemSchema,
  type WishlistItemValues,
} from "@/lib/validation/wishlist";
import type { Sizes, WishlistItem } from "@/types/profile";

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

const FASHION_CATEGORY = "Fashion";

function defaultValues(initialItem?: WishlistItem): WishlistItemValues {
  return {
    name: initialItem?.name ?? "",
    description: initialItem?.description ?? "",
    category: initialItem?.category ?? CATEGORY_OPTIONS[0],
    budgetLevel: initialItem?.budgetLevel ?? "under_25",
    priority: initialItem?.priority ?? "would_love",
    isPublic: initialItem?.isPublic ?? true,
    preferredSize: initialItem?.preferredSize ?? "",
  };
}

export function WishlistItemDialog({
  open,
  onClose,
  onSubmit,
  initialItem,
  sizes,
}: {
  open: boolean;
  onClose: () => void;
  /** Returns the saved item so a photo picked while adding a brand-new
   * item can be attached as soon as the row exists. */
  onSubmit: (values: WishlistItemValues) => Promise<WishlistItem | null>;
  initialItem?: WishlistItem;
  sizes: Sizes;
}) {
  const { uploadWishlistItemImage, removeWishlistItemImage } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // An existing item's photo is saved the moment it's picked. A new
  // item has no row to attach to yet, so its file waits here and is
  // uploaded straight after the item is created.
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<WishlistItemValues>({
    resolver: zodResolver(wishlistItemSchema),
    defaultValues: defaultValues(initialItem),
  });

  const hasReset = useRef(false);
  useEffect(() => {
    if (open && !hasReset.current) {
      reset(defaultValues(initialItem));
      setSavedImageUrl(initialItem?.imageUrl ?? null);
      setPendingFile(null);
      setPendingPreview(null);
      setImageError(null);
      setSaveError(null);
      hasReset.current = true;
    }
    if (!open) {
      hasReset.current = false;
    }
  }, [open, initialItem, reset]);

  // Object URLs hold onto the picked file until explicitly released.
  useEffect(() => {
    if (!pendingPreview) return;
    return () => URL.revokeObjectURL(pendingPreview);
  }, [pendingPreview]);

  const category = useWatch({ control, name: "category" });
  const name = useWatch({ control, name: "name" });
  const preferredSize = useWatch({ control, name: "preferredSize" });
  const isFashion = category === FASHION_CATEGORY;

  // Once someone's saved their sizes, adding "Sneakers" or "A ring" to
  // the wishlist can fill the size in for them — only when the field is
  // still blank, so it never overwrites something they typed themselves.
  useEffect(() => {
    if (!isFashion || !name.trim()) return;
    const sizeType = guessSizeType(name);
    if (!sizeType) return;
    const suggestion = sizes[sizeType]?.trim();
    if (!suggestion) return;
    if (!preferredSize.trim()) {
      setValue("preferredSize", suggestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFashion, name]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError(null);

    // No row yet — hold the file and show it locally until save.
    if (!initialItem) {
      setPendingFile(file);
      setPendingPreview(URL.createObjectURL(file));
      return;
    }

    setImageBusy(true);
    try {
      const result = await uploadWishlistItemImage(initialItem.id, file);
      if (!result.success || !result.item) {
        setImageError(result.error ?? "Couldn't add that photo. Try again.");
        return;
      }
      setSavedImageUrl(result.item.imageUrl);
    } catch {
      setImageError("Couldn't add that photo. Try again.");
    } finally {
      setImageBusy(false);
    }
  }

  async function handleRemovePhoto() {
    setImageError(null);
    if (!initialItem) {
      setPendingFile(null);
      setPendingPreview(null);
      return;
    }
    setImageBusy(true);
    try {
      const result = await removeWishlistItemImage(initialItem.id);
      if (!result.success) {
        setImageError(result.error ?? "Couldn't remove that photo.");
        return;
      }
      setSavedImageUrl(null);
    } catch {
      setImageError("Couldn't remove that photo.");
    } finally {
      setImageBusy(false);
    }
  }

  async function submit(values: WishlistItemValues) {
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await onSubmit(values);
      // null means the save itself failed. Stay open so whatever they
      // typed is still there to retry, rather than closing on nothing.
      if (!saved) {
        setSaveError("Couldn't save that item. Try again.");
        return;
      }
      // The item saved either way; a failed photo upload shouldn't throw
      // away the item they just wrote, so it only surfaces an error.
      if (pendingFile) {
        const result = await uploadWishlistItemImage(saved.id, pendingFile);
        if (!result.success) {
          setImageError(
            result.error ?? "Item saved, but the photo didn't upload.",
          );
          return;
        }
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = pendingPreview ?? savedImageUrl;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialItem ? "Edit wishlist item" : "Add a wishlist item"}
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-800">Photo</span>
          <div className="flex items-center gap-3">
            {previewUrl ? (
              // A plain img, not next/image: this is either a local
              // object: URL for a not-yet-uploaded file or a short-lived
              // signed URL, neither of which the optimizer can fetch.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-neutral-400">
                <ImagePlus className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <div className="flex flex-col items-start gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={imageBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                )}
                {previewUrl ? "Replace photo" : "Add a photo"}
              </Button>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={imageBusy}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Remove photo
                </button>
              )}
            </div>
          </div>
          {!previewUrl && (
            <p className="text-xs text-neutral-500">
              Optional. Without one, the card shows an icon for the category.
            </p>
          )}
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
            onChange={handleFileChange}
          />
        </div>
        <TextField
          label="Item name"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextAreaField
          label="Notes"
          hint="Preferred color or details that help a gift-giver."
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
        {isFashion && (
          <TextField
            label="Preferred size"
            hint="Filled in from your Sizes section when we can tell what it is — change it any time."
            placeholder="e.g. M, 32x34, 9, 7.5"
            error={errors.preferredSize?.message}
            {...register("preferredSize")}
          />
        )}
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
        {saveError && (
          <p className="text-sm text-red-600" role="alert">
            {saveError}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || imageBusy}>
            {initialItem ? "Save changes" : "Add item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
