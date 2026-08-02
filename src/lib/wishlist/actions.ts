"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import { isExternalImagePath, rowToWishlistItem } from "@/lib/wishlist/dal";
import { searchUnsplashPhoto, trackUnsplashDownload } from "@/lib/images/unsplash";
import {
  wishlistItemSchema,
  type WishlistItemValues,
} from "@/lib/validation/wishlist";
import type { WishlistItem } from "@/types/profile";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

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

/**
 * Best-effort auto-photo for an item that doesn't have one yet. Never
 * throws and never blocks the save it's attached to — if Unsplash isn't
 * configured or turns up nothing, the item just keeps its placeholder.
 */
async function attachAutoPhoto(
  supabase: SupabaseClient<Database>,
  itemId: string,
  query: string,
): Promise<void> {
  const photo = await searchUnsplashPhoto(query);
  if (!photo) return;

  await supabase
    .from("wishlist_items")
    .update({
      image_path: photo.url,
      image_attribution_name: photo.attributionName,
      image_attribution_url: photo.attributionUrl,
    })
    .eq("id", itemId);

  void trackUnsplashDownload(photo.downloadLocation);
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

  await attachAutoPhoto(supabase, data.id, parsed.data.name);

  const { data: withPhoto } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("id", data.id)
    .single();

  return { success: true, item: await rowToWishlistItem(supabase, withPhoto ?? data) };
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

  let finalRow = data;
  if (!data.image_path) {
    await attachAutoPhoto(supabase, data.id, parsed.data.name);
    const { data: withPhoto } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("id", data.id)
      .single();
    finalRow = withPhoto ?? data;
  }

  return { success: true, item: await rowToWishlistItem(supabase, finalRow) };
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
    .update({
      image_path: path,
      image_attribution_name: null,
      image_attribution_url: null,
    })
    .eq("id", itemId)
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (updateError || !data) {
    await supabase.storage.from("wishlist-images").remove([path]).catch(() => {});
    return { success: false, error: updateError?.message ?? "Couldn't save that photo." };
  }

  if (existing.image_path && !isExternalImagePath(existing.image_path)) {
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
    .update({
      image_path: null,
      image_attribution_name: null,
      image_attribution_url: null,
    })
    .eq("id", itemId)
    .eq("profile_id", profileId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Couldn't remove that photo." };
  }

  if (!isExternalImagePath(existing.image_path)) {
    await supabase.storage.from("wishlist-images").remove([existing.image_path]).catch(() => {});
  }

  return { success: true, item: await rowToWishlistItem(supabase, data) };
}
