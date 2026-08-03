import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/profile/active";
import {
  DEFAULT_HIDDEN_SECTIONS,
  SECTION_TS_KEYS,
  dbKeyToTsKey,
  defaultSectionValue,
  type SectionTsKey,
} from "@/lib/profile/section-keys";
import type { Database } from "@/types/database";
import type {
  BasicInfo,
  GiftProfile,
  ProfileStatus,
  SectionVisibility,
  ThemeKey,
} from "@/types/profile";

const AVATAR_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

export async function getAvatarSignedUrl(
  supabase: SupabaseClient<Database>,
  avatarPath: string | null,
): Promise<string | null> {
  if (!avatarPath) return null;
  const { data } = await supabase.storage
    .from("avatars")
    .createSignedUrl(avatarPath, AVATAR_SIGNED_URL_TTL_SECONDS);
  return data?.signedUrl ?? null;
}

function buildDefaultSectionVisibility(): SectionVisibility {
  return Object.fromEntries(
    SECTION_TS_KEYS.map((key) => [
      key,
      !DEFAULT_HIDDEN_SECTIONS.includes(key),
    ]),
  ) as SectionVisibility;
}

/**
 * A blank GiftProfile matching empty defaults for every field — used as
 * a safe fallback while a redirect from requireAuthUser() is in flight
 * (the (app) layout fetches profile data before any page-level auth
 * check runs) rather than crashing the layout render.
 */
export function buildEmptyProfile(): GiftProfile {
  const sectionValues = Object.fromEntries(
    SECTION_TS_KEYS.map((key) => [key, defaultSectionValue(key)]),
  ) as Pick<GiftProfile, (typeof SECTION_TS_KEYS)[number]>;

  return {
    basicInfo: {
      displayName: "",
      slug: "",
      introduction: "",
      giftStyleSummary: "",
      avatarUrl: null,
      avatarEmoji: null,
      avatarEmojiBg: null,
    },
    ...sectionValues,
    privacy: {
      status: "draft",
      sectionVisibility: buildDefaultSectionVisibility(),
    },
  };
}

/**
 * Loads the currently active profile (the signed-in user's own, or one
 * they manage — see getActiveProfileId()), shaped exactly like the
 * GiftProfile the profile-builder UI already expects, plus its theme and
 * publish status. Returns null only if there's no session — a missing
 * profiles row (shouldn't happen post-signup, but defensively handled)
 * falls back to sensible empty defaults rather than crashing, since a
 * brand new profile has nothing in profile_sections yet.
 */
export async function getFullProfileForEditing(): Promise<{
  profile: GiftProfile;
  theme: ThemeKey;
  status: ProfileStatus;
  isSimpleProfile: boolean;
} | null> {
  const profileId = await getActiveProfileId();
  if (!profileId) return null;

  const supabase = await createClient();

  const [{ data: profileRow }, { data: sectionRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", profileId).maybeSingle(),
    supabase
      .from("profile_sections")
      .select("section_key, data, is_public")
      .eq("profile_id", profileId),
  ]);

  const avatarUrl = await getAvatarSignedUrl(
    supabase,
    profileRow?.avatar_path ?? null,
  );

  const basicInfo: BasicInfo = {
    displayName: profileRow?.display_name ?? "",
    slug: profileRow?.slug ?? "",
    introduction: profileRow?.introduction ?? "",
    giftStyleSummary: profileRow?.gift_style_summary ?? "",
    avatarUrl,
    avatarEmoji: profileRow?.avatar_emoji ?? null,
    avatarEmojiBg: profileRow?.avatar_emoji_bg ?? null,
  };

  const sectionVisibility = buildDefaultSectionVisibility();
  const sectionValues = Object.fromEntries(
    SECTION_TS_KEYS.map((key) => [key, defaultSectionValue(key)]),
  ) as Pick<GiftProfile, (typeof SECTION_TS_KEYS)[number]>;

  const mutableSectionValues = sectionValues as Record<
    SectionTsKey,
    string[] | typeof sectionValues.sizes
  >;
  for (const row of sectionRows ?? []) {
    const tsKey = dbKeyToTsKey(row.section_key);
    if (!tsKey) continue;
    mutableSectionValues[tsKey] = row.data as string[] | typeof sectionValues.sizes;
    sectionVisibility[tsKey] = row.is_public;
  }

  const profile: GiftProfile = {
    basicInfo,
    ...sectionValues,
    privacy: {
      status: profileRow?.status ?? "draft",
      sectionVisibility,
    },
  };

  return {
    profile,
    theme: (profileRow?.default_theme as ThemeKey) ?? "general",
    status: profileRow?.status ?? "draft",
    isSimpleProfile: profileRow?.is_simple_profile ?? false,
  };
}
