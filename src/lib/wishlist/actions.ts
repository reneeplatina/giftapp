"use server";

import { randomUUID } from "node:crypto";
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

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
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Couldn't save item." };
  }

  return { success: true, item: await rowToWishlistItem(supabase, data) };
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
    })
    .eq("id", id)
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Couldn't save item." };
  }

  return { success: true, item: await rowToWishlistItem(supabase, data) };
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

export async function uploadWishlistItemImageAction(
  itemId: string,
  file: File,
): Promise<WishlistActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Use a PNG, JPEG, or WEBP image." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be under 5MB." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("image_path")
    .eq("id", itemId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Item not found." };
  }

  const extension =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${profileId}/${itemId}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("wishlist-images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data, error: updateError } = await supabase
    .from("wishlist_items")
    .update({ image_path: path })
    .eq("id", itemId)
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (updateError || !data) {
    await supabase.storage.from("wishlist-images").remove([path]).catch(() => {});
    return { success: false, error: updateError?.message ?? "Couldn't save that photo." };
  }

  if (existing.image_path) {
    await supabase.storage.from("wishlist-images").remove([existing.image_path]).catch(() => {});
  }

  return { success: true, item: await rowToWishlistItem(supabase, data) };
}

export async function removeWishlistItemImageAction(
  itemId: string,
): Promise<WishlistActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("image_path")
    .eq("id", itemId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!existing || !existing.image_path) {
    return { success: false, error: "No photo to remove." };
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .update({ image_path: null })
    .eq("id", itemId)
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Couldn't remove that photo." };
  }

  await supabase.storage.from("wishlist-images").remove([existing.image_path]).catch(() => {});

  return { success: true, item: await rowToWishlistItem(supabase, data) };
}
