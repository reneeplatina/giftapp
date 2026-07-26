import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import type { Database } from "@/types/database";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export interface ProfileImageView {
  id: string;
  imageUrl: string | null;
  isPublic: boolean;
}

export async function getProfileImageSignedUrl(
  supabase: SupabaseClient<Database>,
  imagePath: string,
): Promise<string | null> {
  const { data } = await supabase.storage
    .from("profile-images")
    .createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

/**
 * All of the active profile's "My Images" — the owner's editing view,
 * public and private alike. Public-only filtering for visitors happens
 * separately, through get_public_profile().
 */
export async function getProfileImagesForEditing(): Promise<ProfileImageView[]> {
  const profileId = await getActiveProfileId();
  if (!profileId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_images")
    .select("id, image_path, is_public")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!data) return [];

  return Promise.all(
    data.map(async (row) => ({
      id: row.id,
      imageUrl: await getProfileImageSignedUrl(supabase, row.image_path),
      isPublic: row.is_public,
    })),
  );
}
