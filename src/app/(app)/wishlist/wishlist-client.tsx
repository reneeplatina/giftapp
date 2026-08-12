"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ListChecks } from "lucide-react";
import { Container } from "@/components/container";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SelectField } from "@/components/ui/select-field";
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card";
import { WishlistItemDialog } from "@/components/wishlist/wishlist-item-dialog";
import {
  BUDGET_LABELS,
  BUDGET_TIER_BY_LEVEL,
  BUDGET_TIER_LABEL,
  BUDGET_TIER_ORDER,
  BUDGET_TIER_SYMBOL,
  CATEGORY_OPTIONS,
} from "@/lib/mock/profile";
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
  const { profile, wishlistItems, addWishlistItem, updateWishlistItem, removeWishlistItem } =
    useProfile();
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | undefined>();
  const [deletingItem, setDeletingItem] = useState<WishlistItem | undefined>();
  // Tiers start collapsed to keep this page short, which would otherwise
  // mean a just-saved item silently lands inside a closed section and
  // looks like it didn't save. Bumping a per-tier counter on save changes
  // that section's key, remounting just it in the open state — every other
  // section keeps whatever the reader had toggled, and saving twice into
  // the same tier re-opens it each time.
  const [saveCountByTier, setSaveCountByTier] = useState<Record<string, number>>(
    {},
  );

  const filteredItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      const budgetMatch = budgetFilter === "all" || item.budgetLevel === budgetFilter;
      const categoryMatch =
        categoryFilter === "all" || item.category === categoryFilter;
      return budgetMatch && categoryMatch;
    });
  }, [wishlistItems, budgetFilter, categoryFilter]);

  const itemsByTier = useMemo(
    () =>
      BUDGET_TIER_ORDER.map((tier) => ({
        tier,
        items: filteredItems.filter(
          (item) => BUDGET_TIER_BY_LEVEL[item.budgetLevel] === tier,
        ),
      })).filter((group) => group.items.length > 0),
    [filteredItems],
  );

  function openAddDialog() {
    setEditingItem(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(item: WishlistItem) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  async function handleSubmit(values: WishlistItemValues) {
    const result = editingItem
      ? await updateWishlistItem(editingItem.id, values)
      : await addWishlistItem(values);

    if (!result.success) return null;

    const savedTier = BUDGET_TIER_BY_LEVEL[values.budgetLevel];
    setSaveCountByTier((prev) => ({
      ...prev,
      [savedTier]: (prev[savedTier] ?? 0) + 1,
    }));
    // Handed back so the dialog can attach a photo picked while adding.
    return result.item ?? null;
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
        <Accordion>
          {itemsByTier.map(({ tier, items }, index) => (
            <AccordionItem
              // The key only changes for the tier that was just saved
              // into (or when filtering reshuffles which tier is first),
              // so only that section remounts and thus re-opens. Every
              // other section keeps whatever the reader toggled.
              key={`${tier}-${index}-${saveCountByTier[tier] ?? 0}`}
              defaultOpen={index === 0 || (saveCountByTier[tier] ?? 0) > 0}
              title={
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-emerald-600">
                    {BUDGET_TIER_SYMBOL[tier]}
                  </span>
                  {BUDGET_TIER_LABEL[tier]}
                  <span className="text-sm font-normal text-neutral-500">
                    ({items.length})
                  </span>
                </span>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <WishlistItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => openEditDialog(item)}
                    onDelete={() => setDeletingItem(item)}
                  />
                ))}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <WishlistItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialItem={editingItem}
        sizes={profile.sizes}
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
