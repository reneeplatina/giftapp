"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/dal";
import { getAvatarSignedUrl } from "@/lib/profile/dal";
import {
  DEFAULT_HIDDEN_SECTIONS,
  SECTION_KEY_MAP,
  SECTION_TS_KEYS,
  defaultSectionValue,
  type SectionTsKey,
} from "@/lib/profile/section-keys";
import {
  basicInfoSchema,
  sizesSchema,
  type BasicInfoValues,
  type SizesValues,
} from "@/lib/validation/profile";
import type { Database } from "@/types/database";
import type { ProfileStatus, SectionVisibility, ThemeKey } from "@/types/profile";

export interface ProfileActionResult {
  success: boolean;
  error?: string;
}

const THEME_KEYS = [
  "general", "birthday", "christmas", "anniversary", "graduation",
  "valentines", "mothers_day", "fathers_day", "wedding", "baby_shower",
  "housewarming",
] as const;

const chipListSchema = z.array(z.string().min(1).max(80)).max(60);

async function requireProfileId(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.id ?? null;
}

async function upsertSectionRow(
  supabase: SupabaseClient<Database>,
  profileId: string,
  tsKey: SectionTsKey,
  patch: { data?: unknown; isPublic?: boolean },
): Promise<string | null> {
  const dbKey = SECTION_KEY_MAP[tsKey];
  const { data: existing } = await supabase
    .from("profile_sections")
    .select("data, is_public")
    .eq("profile_id", profileId)
    .eq("section_key", dbKey)
    .maybeSingle();

  const data =
    patch.data !== undefined ? patch.data : existing?.data ?? defaultSectionValue(tsKey);
  const isPublic =
    patch.isPublic !== undefined
      ? patch.isPublic
      : existing?.is_public ?? !DEFAULT_HIDDEN_SECTIONS.includes(tsKey);

  const { error } = await supabase
    .from("profile_sections")
    .upsert(
      {
        profile_id: profileId,
        section_key: dbKey,
        data: data as Database["public"]["Tables"]["profile_sections"]["Insert"]["data"],
        is_public: isPublic,
      },
      { onConflict: "profile_id,section_key" },
    );

  return error?.message ?? null;
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
    .update({ avatar_path: path })
    .eq("id", profileId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  const avatarUrl = await getAvatarSignedUrl(supabase, path);
  return { success: true, avatarUrl: avatarUrl ?? undefined };
}
