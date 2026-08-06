"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import { getAvatarSignedUrl, getFullProfileForEditing } from "@/lib/profile/dal";
import { SECTION_TS_KEYS, type SectionTsKey } from "@/lib/profile/section-keys";
import { upsertSectionRow } from "@/lib/profile/section-writes";
import { combineBirthday } from "@/lib/birthday";
import {
  avatarEmojiSchema,
  basicInfoSchema,
  sizesSchema,
  type AvatarEmojiValues,
  type BasicInfoValues,
  type SizesValues,
} from "@/lib/validation/profile";
import type { GiftProfile, ProfileStatus, SectionVisibility, ThemeKey } from "@/types/profile";

/**
 * Re-reads the signed-in user's full profile from the database. Used to
 * resync ProfileContext's in-memory state after something outside the
 * context's own optimistic-update flow writes to the profile directly
 * (currently: the AI interview's server actions in
 * src/lib/interview/actions.ts, which persist via Supabase rather than
 * through this context's update* functions).
 */
export async function getProfileSnapshotAction(): Promise<
  | { success: true; profile: GiftProfile; theme: ThemeKey }
  | { success: false; error: string }
> {
  const loaded = await getFullProfileForEditing();
  if (!loaded) return { success: false, error: "Not signed in." };
  return { success: true, profile: loaded.profile, theme: loaded.theme };
}

export interface ProfileActionResult {
  success: boolean;
  error?: string;
}

const THEME_KEYS = [
  "general", "rose", "blush", "amber", "sage", "teal", "sky",
  "lavender", "stone", "rainbow", "christmas",
] as const;

const chipListSchema = z.array(z.string().min(1).max(80)).max(60);

async function requireProfileId(): Promise<string | null> {
  return getActiveProfileId();
}

export async function saveBasicInfoAction(
  values: BasicInfoValues,
): Promise<ProfileActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const parsed = basicInfoSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Please check the form for errors." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      slug: parsed.data.slug,
      introduction: parsed.data.introduction,
      gift_style_summary: parsed.data.giftStyleSummary,
      birthday: combineBirthday(parsed.data.birthMonth, parsed.data.birthDay),
    })
    .eq("id", profileId);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "That profile link is already taken." };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function saveSizesAction(
  values: SizesValues,
): Promise<ProfileActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const parsed = sizesSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Please check the form for errors." };
  }

  const supabase = await createClient();
  const error = await upsertSectionRow(supabase, profileId, "sizes", {
    data: parsed.data,
  });

  return error ? { success: false, error } : { success: true };
}

export async function saveChipListAction(
  key: Exclude<SectionTsKey, "sizes">,
  items: string[],
): Promise<ProfileActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };
  if (!SECTION_TS_KEYS.includes(key)) {
    return { success: false, error: "Unknown section." };
  }

  const parsed = chipListSchema.safeParse(items);
  if (!parsed.success) {
    return { success: false, error: "Please check the list for errors." };
  }

  const supabase = await createClient();
  const error = await upsertSectionRow(supabase, profileId, key, {
    data: parsed.data,
  });

  return error ? { success: false, error } : { success: true };
}

export async function saveSectionVisibilityAction(
  visibility: SectionVisibility,
): Promise<ProfileActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  const results = await Promise.all(
    SECTION_TS_KEYS.map((key) =>
      upsertSectionRow(supabase, profileId, key, {
        isPublic: Boolean(visibility[key]),
      }),
    ),
  );

  const firstError = results.find((error): error is string => Boolean(error));
  return firstError ? { success: false, error: firstError } : { success: true };
}

export async function saveThemeAction(
  theme: ThemeKey,
): Promise<ProfileActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };
  if (!THEME_KEYS.includes(theme)) {
    return { success: false, error: "Unknown theme." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ default_theme: theme })
    .eq("id", profileId);

  return error ? { success: false, error: error.message } : { success: true };
}

export async function saveStatusAction(
  status: ProfileStatus,
): Promise<ProfileActionResult> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", profileId);

  return error ? { success: false, error: error.message } : { success: true };
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function uploadAvatarAction(
  file: File,
): Promise<ProfileActionResult & { avatarUrl?: string }> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { success: false, error: "Use a PNG, JPEG, or WEBP image." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { success: false, error: "Image must be under 5MB." };
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${profileId}/avatar.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_path: path, avatar_emoji: null, avatar_emoji_bg: null })
    .eq("id", profileId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  const avatarUrl = await getAvatarSignedUrl(path);
  return { success: true, avatarUrl: avatarUrl ?? undefined };
}

export async function setAvatarEmojiAction(
  values: AvatarEmojiValues,
): Promise<ProfileActionResult & { emoji?: string; backgroundColor?: string }> {
  const profileId = await requireProfileId();
  if (!profileId) return { success: false, error: "Not signed in." };

  const parsed = avatarEmojiSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: "Couldn't set that avatar." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", profileId)
    .maybeSingle();

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_emoji: parsed.data.emoji,
      avatar_emoji_bg: parsed.data.backgroundColor,
      avatar_path: null,
    })
    .eq("id", profileId);

  if (error) {
    return { success: false, error: error.message };
  }

  if (existing?.avatar_path) {
    await supabase.storage.from("avatars").remove([existing.avatar_path]).catch(() => {});
  }

  return {
    success: true,
    emoji: parsed.data.emoji,
    backgroundColor: parsed.data.backgroundColor,
  };
}
