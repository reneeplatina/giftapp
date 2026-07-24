import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/dal";
import type { Database } from "@/types/database";
import type { WishlistItem } from "@/types/profile";

type WishlistItemRow = Database["public"]["Tables"]["wishlist_items"]["Row"];

export function rowToWishlistItem(row: WishlistItemRow): WishlistItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category ?? "",
    budgetLevel: row.budget_level ?? "under_25",
    priority: row.priority,
    isPublic: row.is_public,
    isArchived: row.is_archived,
  };
}

/**
 * All of the signed-in user's own wishlist items, public and private
 * alike — this is the owner's editing view. Public-only filtering for
 * visitors happens separately, through get_public_profile().
 */
export async function getWishlistItemsForEditing(): Promise<WishlistItem[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("profile_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []).map(rowToWishlistItem);
}
