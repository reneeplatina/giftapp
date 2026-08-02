import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/lib/profile/dal";
import { getProfileImageSignedUrl } from "@/lib/profile-images/dal";
import { getWishlistImageSignedUrl } from "@/lib/wishlist/dal";
import {
  SECTION_TS_KEYS,
  dbKeyToTsKey,
  defaultSectionValue,
  type SectionTsKey,
} from "@/lib/profile/section-keys";
import type { GiftProfile, SectionVisibility, ThemeKey, WishlistItem } from "@/types/profile";

export interface PublicLinkedProfile {
  slug: string;
  displayName: string;
  avatarUrl: string | null;
}

interface PublicProfileRpcResult {
  slug: string;
  displayName: string;
  avatarPath: string | null;
  introduction: string;
  giftStyleSummary: string;
  theme: string;
  sections: { sectionKey: string; data: unknown }[];
  wishlistItems: {
    id: string;
    name: string;
    description: string | null;
    imagePath: string | null;
    category: string | null;
    budgetLevel: string | null;
    priority: string;
  }[];
  managedProfiles: {
    slug: string;
    displayName: string;
    avatarPath: string | null;
  }[];
  images: {
    id: string;
    imagePath: string;
    caption: string | null;
  }[];
}

export interface PublicProfileImage {
  id: string;
  imageUrl: string | null;
  caption: string;
}

/**
 * Loads a profile the way any anonymous visitor would see it, via the
 * get_public_profile() SECURITY DEFINER function — the only sanctioned
 * way to read someone else's profile data (see
 * docs/DATABASE_SCHEMA.md). Returns null for a nonexistent slug or a
 * profile that isn't published; a visitor can't tell the two apart.
 *
 * Sections the owner marked Hidden are already excluded by the function
 * itself, so sectionVisibility here is derived only from which sections
 * came back (true) vs. didn't (false) — this is display bookkeeping,
 * not a second privacy check.
 */
export const getPublicProfileBySlug = cache(async (slug: string): Promise<{
  profile: GiftProfile;
  theme: ThemeKey;
  wishlistItems: WishlistItem[];
  linkedProfiles: PublicLinkedProfile[];
  images: PublicProfileImage[];
} | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_profile", {
    profile_slug: slug,
  });

  if (error || !data) return null;
  const result = data as unknown as PublicProfileRpcResult;

  const avatarUrl = await getAvatarSignedUrl(supabase, result.avatarPath);

  const sectionValues = Object.fromEntries(
    SECTION_TS_KEYS.map((key) => [key, defaultSectionValue(key)]),
  ) as Pick<GiftProfile, (typeof SECTION_TS_KEYS)[number]>;
  const sectionVisibility = Object.fromEntries(
    SECTION_TS_KEYS.map((key) => [key, false]),
  ) as SectionVisibility;

  const mutableSectionValues = sectionValues as Record<
    SectionTsKey,
    string[] | typeof sectionValues.sizes
  >;
  for (const section of result.sections ?? []) {
    const tsKey = dbKeyToTsKey(section.sectionKey);
    if (!tsKey) continue;
    mutableSectionValues[tsKey] = section.data as string[] | typeof sectionValues.sizes;
    sectionVisibility[tsKey] = true;
  }

  const profile: GiftProfile = {
    basicInfo: {
      displayName: result.displayName,
      slug: result.slug,
      introduction: result.introduction,
      giftStyleSummary: result.giftStyleSummary,
      avatarUrl,
    },
    ...sectionValues,
    privacy: {
      status: "published",
      sectionVisibility,
    },
  };

  const wishlistItems: WishlistItem[] = await Promise.all(
    (result.wishlistItems ?? []).map(async (item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      category: item.category ?? "",
      budgetLevel: (item.budgetLevel as WishlistItem["budgetLevel"]) ?? "under_25",
      priority: item.priority as WishlistItem["priority"],
      isPublic: true,
      isArchived: false,
      imageUrl: await getWishlistImageSignedUrl(supabase, item.imagePath),
    })),
  );

  const linkedProfiles: PublicLinkedProfile[] = await Promise.all(
    (result.managedProfiles ?? []).map(async (linked) => ({
      slug: linked.slug,
      displayName: linked.displayName,
      avatarUrl: await getAvatarSignedUrl(supabase, linked.avatarPath),
    })),
  );

  const images: PublicProfileImage[] = await Promise.all(
    (result.images ?? []).map(async (image) => ({
      id: image.id,
      imageUrl: await getProfileImageSignedUrl(supabase, image.imagePath),
      caption: image.caption ?? "",
    })),
  );

  return {
    profile,
    theme: (result.theme as ThemeKey) ?? "general",
    wishlistItems,
    linkedProfiles,
    images,
  };
});
