"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { INITIAL_WISHLIST_ITEMS, PUBLIC_SITE_ORIGIN } from "@/lib/mock/profile";
import { SECTION_TS_KEYS, type SectionTsKey } from "@/lib/profile/section-keys";
import {
  saveBasicInfoAction,
  saveChipListAction,
  saveSectionVisibilityAction,
  saveSizesAction,
  saveStatusAction,
  saveThemeAction,
  uploadAvatarAction,
  type ProfileActionResult,
} from "@/lib/profile/actions";
import type { GiftProfile, ThemeKey, WishlistItem } from "@/types/profile";

const WISHLIST_STORAGE_KEY = "gift-profile:mock-wishlist:v1";

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
  setTheme: (theme: ThemeKey) => Promise<ProfileActionResult>;
  uploadAvatar: (file: File) => Promise<ProfileActionResult & { avatarUrl?: string }>;
  addWishlistItem: (item: Omit<WishlistItem, "id">) => void;
  updateWishlistItem: (id: string, item: Omit<WishlistItem, "id">) => void;
  removeWishlistItem: (id: string) => void;
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
}: {
  children: ReactNode;
  initialProfile: GiftProfile;
  initialTheme: ThemeKey;
}) {
  const [profile, setProfile] = useState<GiftProfile>(initialProfile);
  const [theme, setThemeState] = useState<ThemeKey>(initialTheme);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(
    INITIAL_WISHLIST_ITEMS,
  );
  const [wishlistHydrated, setWishlistHydrated] = useState(false);

  // Wishlist items are not yet persisted to Supabase (a future phase) —
  // this stays exactly as it was in the mock-data version, unrelated to
  // the real profile/theme state above.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWishlistItems(JSON.parse(raw));
      }
    } catch {
      // Ignore malformed local storage state and keep sample data.
    }
    setWishlistHydrated(true);
  }, []);

  useEffect(() => {
    if (!wishlistHydrated) return;
    window.localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(wishlistItems),
    );
  }, [wishlistItems, wishlistHydrated]);

  const updateBasicInfo = useCallback(
    async (values: GiftProfile["basicInfo"]) => {
      const previous = profile.basicInfo;
      setProfile((prev) => ({ ...prev, basicInfo: values }));
      const result = await saveBasicInfoAction(values);
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
        basicInfo: { ...prev.basicInfo, avatarUrl: result.avatarUrl ?? null },
      }));
    }
    return result;
  }, []);

  const addWishlistItem = useCallback((item: Omit<WishlistItem, "id">) => {
    setWishlistItems((prev) => [
      ...prev,
      { ...item, id: `wl-${Date.now()}-${Math.round(Math.random() * 1000)}` },
    ]);
  }, []);

  const updateWishlistItem = useCallback(
    (id: string, item: Omit<WishlistItem, "id">) => {
      setWishlistItems((prev) =>
        prev.map((existing) =>
          existing.id === id ? { ...item, id } : existing,
        ),
      );
    },
    [],
  );

  const removeWishlistItem = useCallback((id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const completionPercent = useMemo(() => calculateCompletion(profile), [
    profile,
  ]);

  const publicUrl = useMemo(
    () => `${PUBLIC_SITE_ORIGIN}/u/${profile.basicInfo.slug || "renee"}`,
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
    setTheme,
    uploadAvatar,
    addWishlistItem,
    updateWishlistItem,
    removeWishlistItem,
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
