import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import type { Database } from "@/types/database";
import type { WishlistItem } from "@/types/profile";

type WishlistItemRow = Database["public"]["Tables"]["wishlist_items"]["Row"];

export const WISHLIST_IMAGE_BUCKET = "wishlist-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export async function getWishlistImageSignedUrl(
  supabase: SupabaseClient<Database>,
  imagePath: string | null,
): Promise<string | null> {
  if (!imagePath) return null;
  const { data } = await supabase.storage
    .from(WISHLIST_IMAGE_BUCKET)
    .createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export function rowToWishlistItem(
  row: WishlistItemRow,
  imageUrl: string | null = null,
): WishlistItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category ?? "",
    budgetLevel: row.budget_level ?? "under_25",
    priority: row.priority,
    isPublic: row.is_public,
    isArchived: row.is_archived,
    preferredSize: row.preferred_size,
    imageUrl,
  };
}

/** Maps a row and signs its photo URL in one step, for the server
 * actions that return a single freshly-written item. */
export async function rowToWishlistItemWithImage(
  supabase: SupabaseClient<Database>,
  row: WishlistItemRow,
): Promise<WishlistItem> {
  return rowToWishlistItem(
    row,
    await getWishlistImageSignedUrl(supabase, row.image_path),
  );
}

/**
 * All of the active profile's wishlist items (the signed-in user's own,
 * or one they manage), public and private alike — this is the owner's
 * editing view. Public-only filtering for visitors happens separately,
 * through get_public_profile().
 */
export async function getWishlistItemsForEditing(): Promise<WishlistItem[]> {
  const profileId = await getActiveProfileId();
  if (!profileId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  // Each photo needs its own signed-URL round trip, so sign them all
  // together rather than one after another.
  return Promise.all(
    (data ?? []).map(async (row) =>
      rowToWishlistItem(
        row,
        await getWishlistImageSignedUrl(supabase, row.image_path),
      ),
    ),
  );
}
