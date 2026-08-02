import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import type { Database } from "@/types/database";
import type { WishlistItem } from "@/types/profile";

type WishlistItemRow = Database["public"]["Tables"]["wishlist_items"]["Row"];

const WISHLIST_IMAGE_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export async function getWishlistImageSignedUrl(
  supabase: SupabaseClient<Database>,
  imagePath: string | null,
): Promise<string | null> {
  if (!imagePath) return null;
  const { data } = await supabase.storage
    .from("wishlist-images")
    .createSignedUrl(imagePath, WISHLIST_IMAGE_SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

export async function rowToWishlistItem(
  supabase: SupabaseClient<Database>,
  row: WishlistItemRow,
): Promise<WishlistItem> {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category ?? "",
    budgetLevel: row.budget_level ?? "under_25",
    priority: row.priority,
    isPublic: row.is_public,
    isArchived: row.is_archived,
    imageUrl: await getWishlistImageSignedUrl(supabase, row.image_path),
  };
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

  if (!data) return [];
  return Promise.all(data.map((row) => rowToWishlistItem(supabase, row)));
}
