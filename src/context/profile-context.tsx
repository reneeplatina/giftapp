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
import {
  INITIAL_PROFILE,
  INITIAL_WISHLIST_ITEMS,
  PUBLIC_SITE_ORIGIN,
} from "@/lib/mock/profile";
import type { GiftProfile, ThemeKey, WishlistItem } from "@/types/profile";

const STORAGE_KEY = "gift-profile:mock-state:v1";

interface StoredState {
  profile: GiftProfile;
  wishlistItems: WishlistItem[];
  theme: ThemeKey;
}

interface ProfileContextValue {
  profile: GiftProfile;
  wishlistItems: WishlistItem[];
  theme: ThemeKey;
  completionPercent: number;
  publicUrl: string;
  updateBasicInfo: (values: GiftProfile["basicInfo"]) => void;
  updateSizes: (values: GiftProfile["sizes"]) => void;
  updateStringList: (
    key: Extract<
      keyof GiftProfile,
      | "favoriteColors"
      | "interests"
      | "foodAndDrinks"
      | "favoriteStores"
      | "techAndGaming"
      | "homeAndLifestyle"
      | "creativity"
      | "fitnessAndWellness"
      | "experiences"
      | "digitalGifts"
      | "thingsToAvoid"
    >,
    items: string[],
  ) => void;
  updatePrivacy: (values: GiftProfile["privacy"]) => void;
  setTheme: (theme: ThemeKey) => void;
  addWishlistItem: (item: Omit<WishlistItem, "id">) => void;
  updateWishlistItem: (id: string, item: Omit<WishlistItem, "id">) => void;
  removeWishlistItem: (id: string) => void;
  resetToSampleData: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const SECTION_KEYS = [
  "favoriteColors",
  "interests",
  "foodAndDrinks",
  "favoriteStores",
  "techAndGaming",
  "homeAndLifestyle",
  "creativity",
  "fitnessAndWellness",
  "experiences",
  "digitalGifts",
] as const;

function calculateCompletion(profile: GiftProfile): number {
  const checks: boolean[] = [
    Boolean(profile.basicInfo.displayName && profile.basicInfo.introduction),
    Boolean(profile.basicInfo.giftStyleSummary),
    ...SECTION_KEYS.map((key) => profile[key].length > 0),
    Object.values(profile.sizes).some((value) => value.trim().length > 0),
    profile.thingsToAvoid.length > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<GiftProfile>(INITIAL_PROFILE);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(
    INITIAL_WISHLIST_ITEMS,
  );
  const [theme, setThemeState] = useState<ThemeKey>("general");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time load of client-only persisted state; localStorage isn't
    // available during server rendering, so this can't be a lazy useState
    // initializer without causing a hydration mismatch.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredState = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile(stored.profile);
        setWishlistItems(stored.wishlistItems);
        setThemeState(stored.theme);
      }
    } catch {
      // Ignore malformed local storage state and keep sample data.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: StoredState = { profile, wishlistItems, theme };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [profile, wishlistItems, theme, hydrated]);

  const updateBasicInfo = useCallback((values: GiftProfile["basicInfo"]) => {
    setProfile((prev) => ({ ...prev, basicInfo: values }));
  }, []);

  const updateSizes = useCallback((values: GiftProfile["sizes"]) => {
    setProfile((prev) => ({ ...prev, sizes: values }));
  }, []);

  const updateStringList = useCallback(
    (
      key: Extract<
        keyof GiftProfile,
        | "favoriteColors"
        | "interests"
        | "foodAndDrinks"
        | "favoriteStores"
        | "techAndGaming"
        | "homeAndLifestyle"
        | "creativity"
        | "fitnessAndWellness"
        | "experiences"
        | "digitalGifts"
        | "thingsToAvoid"
      >,
      items: string[],
    ) => {
      setProfile((prev) => ({ ...prev, [key]: items }));
    },
    [],
  );

  const updatePrivacy = useCallback((values: GiftProfile["privacy"]) => {
    setProfile((prev) => ({ ...prev, privacy: values }));
  }, []);

  const setTheme = useCallback((next: ThemeKey) => {
    setThemeState(next);
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

  const resetToSampleData = useCallback(() => {
    setProfile(INITIAL_PROFILE);
    setWishlistItems(INITIAL_WISHLIST_ITEMS);
    setThemeState("general");
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
    addWishlistItem,
    updateWishlistItem,
    removeWishlistItem,
    resetToSampleData,
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
