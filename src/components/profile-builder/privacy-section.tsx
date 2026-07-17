"use client";

import { SelectField } from "@/components/ui/select-field";
import { Toggle } from "@/components/ui/toggle";
import { useProfile } from "@/context/profile-context";
import type { ProfileStatus } from "@/types/profile";

const STATUS_OPTIONS: { value: ProfileStatus; label: string }[] = [
  { value: "draft", label: "Draft — only visible to you" },
  { value: "published", label: "Published — anyone with the link can view" },
  { value: "hidden", label: "Hidden — link disabled temporarily" },
];

export function PrivacySection() {
  const { profile, updatePrivacy } = useProfile();
  const { privacy } = profile;

  return (
    <div className="flex flex-col gap-4">
      <SelectField
        label="Profile visibility"
        options={STATUS_OPTIONS}
        value={privacy.status}
        onChange={(event) =>
          updatePrivacy({
            ...privacy,
            status: event.target.value as ProfileStatus,
          })
        }
      />
      <Toggle
        label="Show sizes publicly"
        description="Let visitors see your clothing and shoe sizes."
        checked={privacy.showSizesPublicly}
        onChange={(event) =>
          updatePrivacy({ ...privacy, showSizesPublicly: event.target.checked })
        }
      />
      <Toggle
        label="Show dream gifts publicly"
        description="Include your bigger, aspirational wishlist items."
        checked={privacy.showDreamGiftsPublicly}
        onChange={(event) =>
          updatePrivacy({
            ...privacy,
            showDreamGiftsPublicly: event.target.checked,
          })
        }
      />
      <Toggle
        label="Show things to avoid publicly"
        description="Let visitors see what you dislike or already own."
        checked={privacy.showAvoidListPublicly}
        onChange={(event) =>
          updatePrivacy({
            ...privacy,
            showAvoidListPublicly: event.target.checked,
          })
        }
      />
      <p className="text-xs text-neutral-400">Saved automatically.</p>
    </div>
  );
}
