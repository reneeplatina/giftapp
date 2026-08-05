"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
  onSubmit: (values: WishlistItemValues) => void;
  initialItem?: WishlistItem;
  sizes: Sizes;
}) {
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
      hasReset.current = true;
    }
    if (!open) {
      hasReset.current = false;
    }
  }, [open, initialItem, reset]);

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

  function submit(values: WishlistItemValues) {
    onSubmit(values);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialItem ? "Edit wishlist item" : "Add a wishlist item"}
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
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
