"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { TextAreaField } from "@/components/ui/textarea-field";
import { Toggle } from "@/components/ui/toggle";
import { BUDGET_LABELS, CATEGORY_OPTIONS, PRIORITY_LABELS } from "@/lib/mock/profile";
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
