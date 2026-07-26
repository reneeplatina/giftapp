"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import { getProfileImageSignedUrl, type ProfileImageView } from "@/lib/profile-images/dal";

export interface ProfileImageActionResult {
  success: boolean;
  error?: string;
  item?: ProfileImageView;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function uploadProfileImageAction(
  file: File,
): Promise<ProfileImageActionResult> {
  const profileId = await getActiveProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Use a PNG, JPEG, or WEBP image." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be under 5MB." };
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${profileId}/${randomUUID()}.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data, error: insertError } = await supabase
    .from("profile_images")
    .insert({ profile_id: profileId, image_path: path })
    .select("id, image_path, is_public")
    .single();

  if (insertError || !data) {
    await supabase.storage.from("profile-images").remove([path]).catch(() => {});
    return { success: false, error: insertError?.message ?? "Couldn't save that image." };
  }

  return {
    success: true,
    item: {
      id: data.id,
      imageUrl: await getProfileImageSignedUrl(supabase, data.image_path),
      isPublic: data.is_public,
    },
  };
}

export async function setProfileImageVisibilityAction(
  id: string,
  isPublic: boolean,
): Promise<ProfileImageActionResult> {
  const profileId = await getActiveProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profile_images")
    .update({ is_public: isPublic })
    .eq("id", id)
    .eq("profile_id", profileId);

  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteProfileImageAction(
  id: string,
): Promise<ProfileImageActionResult> {
  const profileId = await getActiveProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profile_images")
    .select("image_path")
    .eq("id", id)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Image not found." };
  }

  const { error } = await supabase
    .from("profile_images")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) return { success: false, error: error.message };

  await supabase.storage.from("profile-images").remove([existing.image_path]).catch(() => {});
  return { success: true };
}
