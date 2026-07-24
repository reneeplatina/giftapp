"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { Toggle } from "@/components/ui/toggle";
import { useProfile } from "@/context/profile-context";
import { SECTION_LABELS, SECTION_TS_KEYS } from "@/lib/profile/section-keys";
import type { ProfileStatus } from "@/types/profile";

const STATUS_OPTIONS: { value: ProfileStatus; label: string }[] = [
  { value: "draft", label: "Draft — only visible to you" },
  { value: "published", label: "Published — anyone with the link can view" },
  { value: "hidden", label: "Hidden — link disabled temporarily" },
];

export function PrivacySection() {
  const { profile, updatePrivacy } = useProfile();
  const { privacy } = profile;
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function applyChange(next: typeof privacy) {
    setError(null);
    const result = await updatePrivacy(next);
    if (!result.success) {
      setError(result.error ?? "Couldn't save. Try again.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <SelectField
        label="Profile visibility"
        options={STATUS_OPTIONS}
        value={privacy.status}
        onChange={(event) =>
          applyChange({
            ...privacy,
            status: event.target.value as ProfileStatus,
          })
        }
      />

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-neutral-800">
          Section visibility
        </p>
        <p className="text-xs text-neutral-500">
          Choose which sections show on your public profile. Everything
          stays hidden until your profile is Published above.
        </p>
      </div>

      {SECTION_TS_KEYS.map((key) => (
        <Toggle
          key={key}
          label={SECTION_LABELS[key]}
          checked={privacy.sectionVisibility[key]}
          onChange={(event) =>
            applyChange({
              ...privacy,
              sectionVisibility: {
                ...privacy.sectionVisibility,
                [key]: event.target.checked,
              },
            })
          }
        />
      ))}

      <div className="flex items-center gap-3">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-700">
            <Check className="h-4 w-4" aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-neutral-500">Saved automatically.</p>
    </div>
  );
}
