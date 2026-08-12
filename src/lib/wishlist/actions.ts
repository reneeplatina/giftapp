"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import {
  WISHLIST_IMAGE_BUCKET,
  rowToWishlistItem,
  rowToWishlistItemWithImage,
} from "@/lib/wishlist/dal";
import {
  wishlistItemSchema,
  type WishlistItemValues,
} from "@/lib/validation/wishlist";
import type { WishlistItem } from "@/types/profile";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

  // A brand-new row can't have a photo yet — the client uploads one
  // straight after this returns, if the person picked one.
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

  return { success: true, item: await rowToWishlistItemWithImage(supabase, data) };
}

export async function removeWishlistItemAction(
  id: string,
): Promise<WishlistActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  // Read the photo path before deleting the row, otherwise the file is
  // stranded in storage with nothing left pointing at it.
  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("image_path")
    .eq("id", id)
    .eq("profile_id", profileId)
    .maybeSingle();

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) return { success: false, error: error.message };

  if (existing?.image_path) {
    await supabase.storage
      .from(WISHLIST_IMAGE_BUCKET)
      .remove([existing.image_path]);
  }

  return { success: true };
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
    .from(WISHLIST_IMAGE_BUCKET)
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
    // The row never picked up the new path, so the file we just wrote is
    // unreferenced — take it back out rather than leaving it behind.
    await supabase.storage.from(WISHLIST_IMAGE_BUCKET).remove([path]);
    return {
      success: false,
      error: updateError?.message ?? "Couldn't save that photo.",
    };
  }

  if (existing.image_path) {
    await supabase.storage
      .from(WISHLIST_IMAGE_BUCKET)
      .remove([existing.image_path]);
  }

  return { success: true, item: await rowToWishlistItemWithImage(supabase, data) };
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

  if (!existing?.image_path) {
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
    return {
      success: false,
      error: error?.message ?? "Couldn't remove that photo.",
    };
  }

  await supabase.storage
    .from(WISHLIST_IMAGE_BUCKET)
    .remove([existing.image_path]);

  return { success: true, item: rowToWishlistItem(data) };
}
