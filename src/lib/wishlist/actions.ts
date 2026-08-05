"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import { rowToWishlistItem } from "@/lib/wishlist/dal";
import {
  wishlistItemSchema,
  type WishlistItemValues,
} from "@/lib/validation/wishlist";
import type { WishlistItem } from "@/types/profile";

export interface WishlistActionResult {
  success: boolean;
  error?: string;
  item?: WishlistItem;
}

async function requireProfileId(): Promise<string | null> {
  return getActiveProfileId();
}

export async function addWishlistItemAction(
  values: WishlistItemValues,
): Promise<WishlistActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const parsed = wishlistItemSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Please check the form for errors." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({
      profile_id: profileId,
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      budget_level: parsed.data.budgetLevel,
      priority: parsed.data.priority,
      is_public: parsed.data.isPublic,
      preferred_size: parsed.data.preferredSize.trim() || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Couldn't save item." };
  }

  return { success: true, item: rowToWishlistItem(data) };
}

export async function updateWishlistItemAction(
  id: string,
  values: WishlistItemValues,
): Promise<WishlistActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const parsed = wishlistItemSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Please check the form for errors." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category,
      budget_level: parsed.data.budgetLevel,
      priority: parsed.data.priority,
      is_public: parsed.data.isPublic,
      preferred_size: parsed.data.preferredSize.trim() || null,
    })
    .eq("id", id)
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Couldn't save item." };
  }

  return { success: true, item: rowToWishlistItem(data) };
}

export async function removeWishlistItemAction(
  id: string,
): Promise<WishlistActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);

  return error ? { success: false, error: error.message } : { success: true };
}
