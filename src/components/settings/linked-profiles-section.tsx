"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserRoundX } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Toggle } from "@/components/ui/toggle";
import { TextField } from "@/components/ui/text-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createManagedProfileAction,
  deleteManagedProfileAction,
  setSimpleProfileModeAction,
  switchActiveProfileAction,
} from "@/lib/profile/managed-actions";
import type { ManagedProfileSummary } from "@/lib/profile/managed-dal";

const STATUS_LABEL: Record<ManagedProfileSummary["status"], string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
};

export function LinkedProfilesSection({
  initialProfiles,
}: {
  initialProfiles: ManagedProfileSummary[];
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [name, setName] = useState("");
  const [isSimpleProfile, setIsSimpleProfile] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ManagedProfileSummary | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setCreateError("Enter a name.");
      return;
    }
    setCreateError(null);
    startTransition(async () => {
      const result = await createManagedProfileAction(trimmed, isSimpleProfile);
      if (result.success && result.profile) {
        setName("");
        setIsSimpleProfile(false);
        setProfiles((prev) => [...prev, result.profile!]);
        router.refresh();
      } else {
        setCreateError(result.error ?? "Couldn't create that profile.");
      }
    });
  }

  function handleToggleSimple(profile: ManagedProfileSummary, next: boolean) {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, isSimpleProfile: next } : p)),
    );
    startTransition(async () => {
      const result = await setSimpleProfileModeAction(profile.id, next);
      if (!result.success) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === profile.id ? { ...p, isSimpleProfile: !next } : p)),
        );
      } else {
        router.refresh();
      }
    });
  }

  function handleSwitch(profileId: string) {
    startTransition(async () => {
      const result = await switchActiveProfileAction(profileId);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  function handleRemove() {
    if (!removeTarget) return;
    const target = removeTarget;
    startTransition(async () => {
      const result = await deleteManagedProfileAction(target.id);
      if (result.success) {
        setProfiles((prev) => prev.filter((p) => p.id !== target.id));
        router.refresh();
      } else {
        setRemoveError(result.error ?? "Couldn't remove that profile.");
      }
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Linked profiles
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Create and manage a gift profile for someone who won&apos;t be
          signing up themselves — a child, a grandparent, anyone.
        </p>
      </div>

      <Card>
        {profiles.length > 0 && (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar
                    name={profile.displayName}
                    src={profile.avatarUrl ?? undefined}
                    emoji={profile.avatarEmoji ?? undefined}
                    emojiBg={profile.avatarEmojiBg ?? undefined}
                    className="h-10 w-10 shrink-0 text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {profile.displayName}
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      <Badge
                        variant={profile.status === "published" ? "success" : "outline"}
                      >
                        {STATUS_LABEL[profile.status]}
                      </Badge>
                      {profile.isSimpleProfile && (
                        <Badge variant="neutral">Simple profile</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSwitch(profile.id)}
                    disabled={pending}
                  >
                    Switch &amp; edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setRemoveError(null);
                      setRemoveTarget(profile);
                    }}
                    disabled={pending}
                  >
                    <UserRoundX className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                </div>
                <Toggle
                  label="Simple profile"
                  description="Just a name, photo, and wishlist — no interest categories to fill in. Good for kids."
                  checked={profile.isSimpleProfile}
                  onChange={(event) => handleToggleSimple(profile, event.target.checked)}
                  disabled={pending}
                />
              </li>
            ))}
          </ul>
        )}

        <div
          className={
            profiles.length > 0
              ? "mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4"
              : "flex flex-col gap-3"
          }
        >
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[12rem] flex-1">
              <TextField
                label="Add a profile for someone"
                placeholder="e.g. Emma"
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={createError ?? undefined}
              />
            </div>
            <Button type="button" onClick={handleCreate} disabled={pending}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add profile
            </Button>
          </div>
          <Checkbox
            label="Simple profile"
            description="Just a name, photo, and wishlist — no interest categories to fill in. Good for kids."
            checked={isSimpleProfile}
            onChange={(event) => setIsSimpleProfile(event.target.checked)}
          />
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title={`Remove ${removeTarget?.displayName ?? "this profile"}?`}
        description="This removes their profile, wishlist, and photos for good — anyone with their link will see it's gone. This can't be undone."
        confirmLabel="Remove profile"
      />
      {removeError && (
        <p className="text-sm text-red-600" role="alert">
          {removeError}
        </p>
      )}
    </section>
  );
}
