"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getAuthUser } from "@/lib/auth/dal";
import { generateUniqueSlug } from "@/lib/profile/slug";
import { ACTIVE_PROFILE_COOKIE, activeProfileCookieOptions } from "@/lib/profile/active";
import { removeAllUnderPrefix } from "@/lib/storage/remove-profile-files";
import type { ManagedProfileSummary } from "@/lib/profile/managed-dal";

export interface ManagedProfileActionResult {
  success: boolean;
  error?: string;
  profileId?: string;
  /** Set on successful creation — lets the caller update its own local list without a full reload. */
  profile?: ManagedProfileSummary;
}

/**
 * Creates a profile the caller manages on someone else's behalf (a
 * child, a grandparent — anyone who wants a gift profile but won't be
 * signing in themselves). profiles.id is still a real FK to auth.users,
 * so this first creates a synthetic auth user with no usable email or
 * password — nobody ever signs in as it; the caller controls it entirely
 * through their own session via managed_by_profile_id and the RLS
 * policies keyed off it (see the managed_profiles migration).
 */
export async function createManagedProfileAction(
  displayName: string,
  isSimpleProfile = false,
): Promise<ManagedProfileActionResult> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Not signed in." };

  const trimmed = displayName.trim();
  if (!trimmed) return { success: false, error: "Enter a name." };
  if (trimmed.length > 60) return { success: false, error: "Keep it under 60 characters." };

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return { success: false, error: "This isn't available right now. Please try again later." };
  }

  const slug = await generateUniqueSlug(serviceClient, trimmed);

  const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
    email: `managed-${randomUUID()}@giftapp.internal`,
    password: randomUUID(),
    email_confirm: true,
    user_metadata: { managed_by: user.id },
  });

  if (createError || !created.user) {
    return { success: false, error: "Couldn't create that profile. Please try again." };
  }

  const { error: insertError } = await serviceClient.from("profiles").insert({
    id: created.user.id,
    slug,
    display_name: trimmed,
    status: "draft",
    managed_by_profile_id: user.id,
    is_simple_profile: isSimpleProfile,
  });

  if (insertError) {
    // Roll back the orphaned auth user so a retry doesn't leave debris.
    await serviceClient.auth.admin.deleteUser(created.user.id).catch(() => {});
    return { success: false, error: "Couldn't create that profile. Please try again." };
  }

  return {
    success: true,
    profileId: created.user.id,
    profile: {
      id: created.user.id,
      displayName: trimmed,
      slug,
      avatarUrl: null,
      avatarEmoji: null,
      avatarEmojiBg: null,
      status: "draft",
      isSimpleProfile,
    },
  };
}

/**
 * Flips a managed profile's simple/full mode — e.g. switching a kid's
 * profile back to the full builder once they're older. Scoped to
 * profiles the caller manages, same as the other managed-profile actions.
 */
export async function setSimpleProfileModeAction(
  profileId: string,
  isSimpleProfile: boolean,
): Promise<ManagedProfileActionResult> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_simple_profile: isSimpleProfile })
    .eq("id", profileId)
    .eq("managed_by_profile_id", user.id);

  if (error) {
    return { success: false, error: "Couldn't update that profile. Please try again." };
  }

  return { success: true };
}

/**
 * Permanently removes a profile the caller manages: its storage files,
 * then its synthetic auth user (which cascades everything else —
 * profile_sections, wishlist_items, ai_interview_sessions/messages —
 * the same way deleteAccountAction cascades a real account).
 */
export async function deleteManagedProfileAction(
  profileId: string,
): Promise<ManagedProfileActionResult> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Not signed in." };

  const supabase = await createClient();
  const { data: managed } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .eq("managed_by_profile_id", user.id)
    .maybeSingle();

  if (!managed) {
    return { success: false, error: "That profile isn't yours to remove." };
  }

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return { success: false, error: "This isn't available right now. Please try again later." };
  }

  await Promise.allSettled([
    removeAllUnderPrefix(serviceClient, "avatars", profileId),
    removeAllUnderPrefix(serviceClient, "wishlist-images", profileId),
    removeAllUnderPrefix(serviceClient, "profile-images", profileId),
  ]);

  const { error } = await serviceClient.auth.admin.deleteUser(profileId);
  if (error) {
    return { success: false, error: "Couldn't remove that profile. Please try again." };
  }

  // If the profile being removed was the active one, fall back to the
  // caller's own profile rather than leaving the cookie pointed at
  // something that no longer exists.
  const store = await cookies();
  if (store.get(ACTIVE_PROFILE_COOKIE)?.value === profileId) {
    store.delete(ACTIVE_PROFILE_COOKIE);
  }

  return { success: true };
}

/**
 * Switches which profile the caller is currently acting as — their own,
 * or one they manage. Verifies the target is actually managed by the
 * caller before setting the cookie; getActiveProfileId() re-verifies
 * this on every read too, so this check is about a clear error message
 * here, not the sole line of defense.
 */
export async function switchActiveProfileAction(
  profileId: string | null,
): Promise<ManagedProfileActionResult> {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Not signed in." };

  const store = await cookies();

  if (!profileId || profileId === user.id) {
    store.delete(ACTIVE_PROFILE_COOKIE);
    return { success: true };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .eq("managed_by_profile_id", user.id)
    .maybeSingle();

  if (!data) {
    return { success: false, error: "You don't manage that profile." };
  }

  store.set(ACTIVE_PROFILE_COOKIE, profileId, activeProfileCookieOptions());
  return { success: true };
}
