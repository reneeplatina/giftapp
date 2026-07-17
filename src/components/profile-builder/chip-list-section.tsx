"use client";

import { ChipMultiSelect } from "@/components/ui/chip-multi-select";
import { useProfile } from "@/context/profile-context";
import type { GiftProfile } from "@/types/profile";

type ChipListKey = Extract<
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
>;

export function ChipListSection({
  profileKey,
  label,
  hint,
  options,
}: {
  profileKey: ChipListKey;
  label: string;
  hint?: string;
  options: string[];
}) {
  const { profile, updateStringList } = useProfile();

  return (
    <div className="flex flex-col gap-3">
      <ChipMultiSelect
        label={label}
        hint={hint}
        options={options}
        value={profile[profileKey]}
        onChange={(next) => updateStringList(profileKey, next)}
      />
      <p className="text-xs text-neutral-400">Saved automatically.</p>
    </div>
  );
}
