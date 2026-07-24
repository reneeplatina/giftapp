"use server";

import { getAuthUser } from "@/lib/auth/dal";
import { getAnthropicClient, getAnthropicModel } from "@/lib/ai/client";
import { AIAssistantError } from "@/lib/ai/errors";
import { runGiftAssistantTurn, type GiftAssistantHistoryItem } from "@/lib/ai/gift-assistant";
import { getOrCreateGuestHash } from "@/lib/ai/guest-identity";
import { checkAndRecordAiUsage } from "@/lib/ai/rate-limit";
import { getFullProfileForEditing } from "@/lib/profile/dal";
import { getPublicProfileBySlug } from "@/lib/profile/public-dal";
import { SECTION_TS_KEYS } from "@/lib/profile/section-keys";
import { getWishlistItemsForEditing } from "@/lib/wishlist/dal";
import type { GiftProfile, WishlistItem } from "@/types/profile";

const AI_FEATURE_NAME = "ai_gift_assistant";
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_LENGTH = 40;

export interface GiftAssistantActionResult {
  success: boolean;
  error?: string;
  reply?: string;
}

/**
 * Builds the facts the assistant is allowed to reason about, respecting
 * per-section visibility and public-only wishlist items — the same rules
 * get_public_profile() applies at the database layer for real visitors.
 */
function buildProfileFacts(loaded: {
  profile: GiftProfile;
  wishlistItems: WishlistItem[];
}): Record<string, unknown> {
  const facts: Record<string, unknown> = {};

  if (loaded.profile.basicInfo.introduction) {
    facts.introduction = loaded.profile.basicInfo.introduction;
  }
  if (loaded.profile.basicInfo.giftStyleSummary) {
    facts.giftStyleSummary = loaded.profile.basicInfo.giftStyleSummary;
  }

  for (const key of SECTION_TS_KEYS) {
    if (!loaded.profile.privacy.sectionVisibility[key]) continue;
    if (key === "sizes") {
      const sizeEntries = Object.entries(loaded.profile.sizes).filter(
        ([, value]) => value.trim().length > 0,
      );
      if (sizeEntries.length > 0) facts.sizes = Object.fromEntries(sizeEntries);
    } else {
      const list = loaded.profile[key] as string[];
      if (list.length > 0) facts[key] = list;
    }
  }

  const publicWishlist = loaded.wishlistItems.filter(
    (item) => item.isPublic && !item.isArchived,
  );
  if (publicWishlist.length > 0) {
    facts.wishlistItems = publicWishlist.map((item) => ({
      name: item.name,
      description: item.description || undefined,
      category: item.category || undefined,
      budgetLevel: item.budgetLevel,
      priority: item.priority,
    }));
  }

  return facts;
}

/**
 * One turn of the visitor-facing gift assistant on a public profile
 * page. Works for both signed-in and anonymous visitors — identity (and
 * therefore which daily limit applies) is resolved server-side, never
 * trusted from the client. Stateless: the client holds the running
 * conversation and resends it each turn; nothing is persisted here.
 */
export async function sendGiftAssistantMessageAction(
  slug: string,
  history: GiftAssistantHistoryItem[],
  message: string,
): Promise<GiftAssistantActionResult> {
  const trimmed = message.trim();
  if (!trimmed) return { success: false, error: "Type a message first." };
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: "Keep messages under 1000 characters." };
  }
  if (history.length > MAX_HISTORY_LENGTH) {
    return {
      success: false,
      error: "This conversation has gotten long — refresh the page to start a new one.",
    };
  }

  const client = getAnthropicClient();
  if (!client) {
    return { success: false, error: "The AI assistant isn't available right now." };
  }

  const user = await getAuthUser();
  const identity = user ? { userId: user.id } : { anonymousHash: await getOrCreateGuestHash() };
  const usage = await checkAndRecordAiUsage(identity, AI_FEATURE_NAME);
  if (!usage.allowed) {
    return { success: false, error: usage.error };
  }

  const loaded = await getPublicProfileBySlug(slug);
  if (!loaded) {
    return { success: false, error: "This profile isn't available right now." };
  }

  try {
    const reply = await runGiftAssistantTurn({
      client,
      model: getAnthropicModel(),
      displayName: loaded.profile.basicInfo.displayName,
      profileFacts: buildProfileFacts(loaded),
      history,
      latestVisitorMessage: trimmed,
    });
    return { success: true, reply };
  } catch (error) {
    const errorMessage =
      error instanceof AIAssistantError ? error.message : "The AI assistant hit an unexpected error.";
    return { success: false, error: errorMessage };
  }
}

/**
 * The same assistant turn, but for the owner's own /preview page. The
 * live public page (and the action above) can only ever load a published
 * profile, since that's genuinely all a real visitor could see — but the
 * owner previewing their own in-progress profile needs the demo to work
 * regardless of publish status. This loads their own data straight from
 * the authenticated editing DAL (never from client-supplied profile
 * data), so it's safe: nobody can use this to see anyone else's profile.
 */
export async function sendGiftAssistantPreviewMessageAction(
  history: GiftAssistantHistoryItem[],
  message: string,
): Promise<GiftAssistantActionResult> {
  const trimmed = message.trim();
  if (!trimmed) return { success: false, error: "Type a message first." };
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: "Keep messages under 1000 characters." };
  }
  if (history.length > MAX_HISTORY_LENGTH) {
    return {
      success: false,
      error: "This conversation has gotten long — refresh the page to start a new one.",
    };
  }

  const client = getAnthropicClient();
  if (!client) {
    return { success: false, error: "The AI assistant isn't available right now." };
  }

  const user = await getAuthUser();
  if (!user) {
    return { success: false, error: "Sign in to preview the assistant." };
  }
  const usage = await checkAndRecordAiUsage({ userId: user.id }, AI_FEATURE_NAME);
  if (!usage.allowed) {
    return { success: false, error: usage.error };
  }

  const [editing, wishlistItems] = await Promise.all([
    getFullProfileForEditing(),
    getWishlistItemsForEditing(),
  ]);
  if (!editing) {
    return { success: false, error: "Couldn't load your profile." };
  }

  try {
    const reply = await runGiftAssistantTurn({
      client,
      model: getAnthropicModel(),
      displayName: editing.profile.basicInfo.displayName,
      profileFacts: buildProfileFacts({ profile: editing.profile, wishlistItems }),
      history,
      latestVisitorMessage: trimmed,
    });
    return { success: true, reply };
  } catch (error) {
    const errorMessage =
      error instanceof AIAssistantError ? error.message : "The AI assistant hit an unexpected error.";
    return { success: false, error: errorMessage };
  }
}
