"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSiteUrl } from "@/lib/site-url";
import { splitBirthday } from "@/lib/birthday";
import { SECTION_TS_KEYS, type SectionTsKey } from "@/lib/profile/section-keys";
import {
  getProfileSnapshotAction,
  saveBasicInfoAction,
  saveChipListAction,
  saveSectionVisibilityAction,
  saveSizesAction,
  saveStatusAction,
  saveThemeAction,
  setAvatarEmojiAction,
  uploadAvatarAction,
  type ProfileActionResult,
} from "@/lib/profile/actions";
import {
  addWishlistItemAction,
  removeWishlistItemAction,
  removeWishlistItemImageAction,
  updateWishlistItemAction,
  uploadWishlistItemImageAction,
  type WishlistActionResult,
} from "@/lib/wishlist/actions";
import type {
  GiftProfile,
  ProfileStatus,
  ThemeKey,
  WishlistItem,
} from "@/types/profile";
import type { WishlistItemValues } from "@/lib/validation/wishlist";

interface ProfileContextValue {
  profile: GiftProfile;
  wishlistItems: WishlistItem[];
  theme: ThemeKey;
  completionPercent: number;
  publicUrl: string;
  updateBasicInfo: (values: GiftProfile["basicInfo"]) => Promise<ProfileActionResult>;
  updateSizes: (values: GiftProfile["sizes"]) => Promise<ProfileActionResult>;
  updateStringList: (
    key: Exclude<SectionTsKey, "sizes">,
    items: string[],
  ) => Promise<ProfileActionResult>;
  updatePrivacy: (values: GiftProfile["privacy"]) => Promise<ProfileActionResult>;
  setStatus: (next: ProfileStatus) => Promise<ProfileActionResult>;
  setTheme: (theme: ThemeKey) => Promise<ProfileActionResult>;
  uploadAvatar: (file: File) => Promise<ProfileActionResult & { avatarUrl?: string }>;
  setAvatarEmoji: (emoji: string, backgroundColor: string) => Promise<ProfileActionResult>;
  /** Re-reads the profile from the database and replaces local state — for updates made outside this context (e.g. the AI interview). */
  refreshProfile: () => Promise<void>;
  addWishlistItem: (item: WishlistItemValues) => Promise<WishlistActionResult>;
  updateWishlistItem: (
    id: string,
    item: WishlistItemValues,
  ) => Promise<WishlistActionResult>;
  removeWishlistItem: (id: string) => Promise<WishlistActionResult>;
  uploadWishlistItemImage: (
    id: string,
    file: File,
  ) => Promise<WishlistActionResult>;
  removeWishlistItemImage: (id: string) => Promise<WishlistActionResult>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function calculateCompletion(profile: GiftProfile): number {
  const checks: boolean[] = [
    Boolean(profile.basicInfo.displayName && profile.basicInfo.introduction),
    Boolean(profile.basicInfo.giftStyleSummary),
    ...SECTION_TS_KEYS.filter((key) => key !== "sizes").map(
      (key) => (profile[key] as string[]).length > 0,
    ),
    Object.values(profile.sizes).some((value) => value.trim().length > 0),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function ProfileProvider({
  children,
  initialProfile,
  initialTheme,
  initialWishlistItems,
}: {
  children: ReactNode;
  initialProfile: GiftProfile;
  initialTheme: ThemeKey;
  initialWishlistItems: WishlistItem[];
}) {
  const [profile, setProfile] = useState<GiftProfile>(initialProfile);
  const [theme, setThemeState] = useState<ThemeKey>(initialTheme);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(
    initialWishlistItems,
  );

  const updateBasicInfo = useCallback(
    async (values: GiftProfile["basicInfo"]) => {
      const previous = profile.basicInfo;
      setProfile((prev) => ({ ...prev, basicInfo: values }));
      const result = await saveBasicInfoAction({
        displayName: values.displayName,
        slug: values.slug,
        introduction: values.introduction,
        giftStyleSummary: values.giftStyleSummary,
        ...splitBirthday(values.birthday),
      });
      if (!result.success) {
        setProfile((prev) => ({ ...prev, basicInfo: previous }));
      }
      return result;
    },
    [profile.basicInfo],
  );

  const updateSizes = useCallback(
    async (values: GiftProfile["sizes"]) => {
      const previous = profile.sizes;
      setProfile((prev) => ({ ...prev, sizes: values }));
      const result = await saveSizesAction(values);
      if (!result.success) {
        setProfile((prev) => ({ ...prev, sizes: previous }));
      }
      return result;
    },
    [profile.sizes],
  );

  const updateStringList = useCallback(
    async (key: Exclude<SectionTsKey, "sizes">, items: string[]) => {
      const previous = profile[key] as string[];
      setProfile((prev) => ({ ...prev, [key]: items }));
      const result = await saveChipListAction(key, items);
      if (!result.success) {
        setProfile((prev) => ({ ...prev, [key]: previous }));
      }
      return result;
    },
    [profile],
  );

  const updatePrivacy = useCallback(
    async (values: GiftProfile["privacy"]) => {
      const previous = profile.privacy;
      setProfile((prev) => ({ ...prev, privacy: values }));
      const [statusResult, visibilityResult] = await Promise.all([
        values.status === previous.status
          ? { success: true }
          : saveStatusAction(values.status),
        saveSectionVisibilityAction(values.sectionVisibility),
      ]);
      const result = !statusResult.success ? statusResult : visibilityResult;
      if (!result.success) {
        setProfile((prev) => ({ ...prev, privacy: previous }));
      }
      return result;
    },
    [profile.privacy],
  );

  // Just the published/draft/hidden switch on its own, for the share
  // controls — they have no reason to rewrite section visibility too.
  const setStatus = useCallback(
    async (next: ProfileStatus) => {
      const previous = profile.privacy.status;
      setProfile((prev) => ({
        ...prev,
        privacy: { ...prev.privacy, status: next },
      }));
      const result = await saveStatusAction(next);
      if (!result.success) {
        setProfile((prev) => ({
          ...prev,
          privacy: { ...prev.privacy, status: previous },
        }));
      }
      return result;
    },
    [profile.privacy.status],
  );

  const setTheme = useCallback(
    async (next: ThemeKey) => {
      const previous = theme;
      setThemeState(next);
      const result = await saveThemeAction(next);
      if (!result.success) {
        setThemeState(previous);
      }
      return result;
    },
    [theme],
  );

  const uploadAvatar = useCallback(async (file: File) => {
    const result = await uploadAvatarAction(file);
    if (result.success) {
      setProfile((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          avatarUrl: result.avatarUrl ?? null,
          avatarEmoji: null,
          avatarEmojiBg: null,
        },
      }));
    }
    return result;
  }, []);

  const setAvatarEmoji = useCallback(async (emoji: string, backgroundColor: string) => {
    const result = await setAvatarEmojiAction({ emoji, backgroundColor });
    if (result.success) {
      setProfile((prev) => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          avatarUrl: null,
          avatarEmoji: result.emoji ?? emoji,
          avatarEmojiBg: result.backgroundColor ?? backgroundColor,
        },
      }));
    }
    return result;
  }, []);

  const addWishlistItem = useCallback(async (item: WishlistItemValues) => {
    const result = await addWishlistItemAction(item);
    if (result.success && result.item) {
      const newItem = result.item;
      setWishlistItems((prev) => [...prev, newItem]);
    }
    return result;
  }, []);

  const updateWishlistItem = useCallback(
    async (id: string, item: WishlistItemValues) => {
      const previous = wishlistItems;
      setWishlistItems((prev) =>
        prev.map((existing) =>
          existing.id === id
            ? { ...existing, ...item, id }
            : existing,
        ),
      );
      const result = await updateWishlistItemAction(id, item);
      if (!result.success) {
        setWishlistItems(previous);
      } else if (result.item) {
        // The optimistic merge above was built from raw form values;
        // swap in the saved row so the photo URL and anything else the
        // server normalised is what the list actually holds.
        const saved = result.item;
        setWishlistItems((prev) =>
          prev.map((existing) => (existing.id === id ? saved : existing)),
        );
      }
      return result;
    },
    [wishlistItems],
  );

  const removeWishlistItem = useCallback(
    async (id: string) => {
      const previous = wishlistItems;
      setWishlistItems((prev) => prev.filter((item) => item.id !== id));
      const result = await removeWishlistItemAction(id);
      if (!result.success) {
        setWishlistItems(previous);
      }
      return result;
    },
    [wishlistItems],
  );

  // Both photo actions return the freshly-saved row, so the list swaps in
  // the server's version (including the new signed photo URL) rather than
  // guessing at it locally.
  const uploadWishlistItemImage = useCallback(async (id: string, file: File) => {
    const result = await uploadWishlistItemImageAction(id, file);
    if (result.success && result.item) {
      const saved = result.item;
      setWishlistItems((prev) =>
        prev.map((item) => (item.id === id ? saved : item)),
      );
    }
    return result;
  }, []);

  const removeWishlistItemImage = useCallback(async (id: string) => {
    const result = await removeWishlistItemImageAction(id);
    if (result.success && result.item) {
      const saved = result.item;
      setWishlistItems((prev) =>
        prev.map((item) => (item.id === id ? saved : item)),
      );
    }
    return result;
  }, []);

  const refreshProfile = useCallback(async () => {
    const result = await getProfileSnapshotAction();
    if (result.success) {
      setProfile(result.profile);
      setThemeState(result.theme);
    }
  }, []);

  const completionPercent = useMemo(() => calculateCompletion(profile), [
    profile,
  ]);

  const publicUrl = useMemo(
    () => `${getSiteUrl()}/u/${profile.basicInfo.slug}`,
    [profile.basicInfo.slug],
  );

  const value: ProfileContextValue = {
    profile,
    wishlistItems,
    theme,
    completionPercent,
    publicUrl,
    updateBasicInfo,
    updateSizes,
    updateStringList,
    updatePrivacy,
    setStatus,
    setTheme,
    uploadAvatar,
    setAvatarEmoji,
    refreshProfile,
    addWishlistItem,
    updateWishlistItem,
    removeWishlistItem,
    uploadWishlistItemImage,
    removeWishlistItemImage,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
