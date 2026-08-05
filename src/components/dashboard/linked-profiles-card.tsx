"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { switchActiveProfileAction } from "@/lib/profile/managed-actions";
import type { ManagedProfileSummary } from "@/lib/profile/managed-dal";

export function DashboardLinkedProfiles({
  profiles,
}: {
  profiles: ManagedProfileSummary[];
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (profiles.length === 0) return null;

  function handleSwitch(profileId: string) {
    startTransition(async () => {
      const result = await switchActiveProfileAction(profileId);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-neutral-900">Also managing</p>
      <ul className="flex flex-col gap-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="flex flex-wrap items-center gap-3">
            <Avatar
              name={profile.displayName}
              src={profile.avatarUrl ?? undefined}
              emoji={profile.avatarEmoji ?? undefined}
              emojiBg={profile.avatarEmojiBg ?? undefined}
              className="h-10 w-10 shrink-0 text-sm"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
              {profile.displayName}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSwitch(profile.id)}
              disabled={pending}
            >
              Switch
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
