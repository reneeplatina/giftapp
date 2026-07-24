"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ListChecks } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SelectField } from "@/components/ui/select-field";
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card";
import { WishlistItemDialog } from "@/components/wishlist/wishlist-item-dialog";
import { BUDGET_LABELS, CATEGORY_OPTIONS } from "@/lib/mock/profile";
import { useProfile } from "@/context/profile-context";
import type { WishlistItem } from "@/types/profile";
import type { WishlistItemValues } from "@/lib/validation/wishlist";

const BUDGET_FILTER_OPTIONS = [
  { value: "all", label: "Any budget" },
  ...Object.entries(BUDGET_LABELS).map(([value, label]) => ({ value, label })),
];

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "Any category" },
  ...CATEGORY_OPTIONS.map((category) => ({ value: category, label: category })),
];

export function WishlistClient() {
  const { wishlistItems, addWishlistItem, updateWishlistItem, removeWishlistItem } =
    useProfile();
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | undefined>();
  const [deletingItem, setDeletingItem] = useState<WishlistItem | undefined>();

  const filteredItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      const budgetMatch = budgetFilter === "all" || item.budgetLevel === budgetFilter;
      const categoryMatch =
        categoryFilter === "all" || item.category === categoryFilter;
      return budgetMatch && categoryMatch;
    });
  }, [wishlistItems, budgetFilter, categoryFilter]);

  function openAddDialog() {
    setEditingItem(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(item: WishlistItem) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  async function handleSubmit(values: WishlistItemValues) {
    if (editingItem) {
      await updateWishlistItem(editingItem.id, values);
    } else {
      await addWishlistItem(values);
    }
  }

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900">
            Wishlist
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Exact items and dream gifts you&apos;d love to receive.
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add item
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Filter by budget"
          options={BUDGET_FILTER_OPTIONS}
          value={budgetFilter}
          onChange={(event) => setBudgetFilter(event.target.value)}
        />
        <SelectField
          label="Filter by category"
          options={CATEGORY_FILTER_OPTIONS}
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        />
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={
            wishlistItems.length === 0
              ? "Your wishlist is empty"
              : "No items match these filters"
          }
          description={
            wishlistItems.length === 0
              ? "Add your first item so friends and family know what to get you."
              : "Try a different budget or category, or add a new item."
          }
        >
          {wishlistItems.length === 0 && (
            <Button onClick={openAddDialog} size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add item
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onEdit={() => openEditDialog(item)}
              onDelete={() => setDeletingItem(item)}
            />
          ))}
        </div>
      )}

      <WishlistItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialItem={editingItem}
      />

      <ConfirmDialog
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(undefined)}
        onConfirm={() => {
          if (deletingItem) removeWishlistItem(deletingItem.id);
        }}
        title="Remove this item?"
        description={`"${deletingItem?.name ?? ""}" will be removed from your wishlist.`}
        confirmLabel="Remove"
      />
    </Container>
  );
}
