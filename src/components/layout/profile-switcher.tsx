"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronsUpDown, Settings2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { switchActiveProfileAction } from "@/lib/profile/managed-actions";
import type { ProfileSwitcherData } from "@/lib/profile/managed-dal";
import { cn } from "@/lib/utils";

export function ProfileSwitcher({
  data,
  className,
}: {
  data: ProfileSwitcherData;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!data.own) return null;

  const active =
    (data.activeProfileId && data.managed.find((p) => p.id === data.activeProfileId)) ||
    data.own;

  const options = [data.own, ...data.managed];

  function handleSelect(profileId: string) {
    if (profileId === active.id) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const result = await switchActiveProfileAction(
        profileId === data.own?.id ? null : profileId,
      );
      if (result.success) {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-neutral-100",
          className,
        )}
      >
        <Avatar
          name={active.displayName}
          src={active.avatarUrl ?? undefined}
          emoji={active.avatarEmoji ?? undefined}
          emojiBg={active.avatarEmojiBg ?? undefined}
          className="h-8 w-8 shrink-0 text-xs"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-neutral-900">
            {active.displayName}
          </span>
          {data.managed.length > 0 && (
            <span className="block text-xs text-neutral-500">Switch profile</span>
          )}
        </span>
        {data.managed.length > 0 && (
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Switch profile"
        description="Manage your own gift profile, or one you've created for someone else."
      >
        <ul className="flex flex-col gap-1">
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => handleSelect(option.id)}
                disabled={pending}
                aria-current={option.id === active.id ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-60",
                  option.id === active.id
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100",
                )}
              >
                <Avatar
                  name={option.displayName}
                  src={option.avatarUrl ?? undefined}
                  emoji={option.avatarEmoji ?? undefined}
                  emojiBg={option.avatarEmojiBg ?? undefined}
                  className="h-8 w-8 shrink-0 text-xs"
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {option.displayName}
                  {option.id === data.own?.id && " (you)"}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Link
          href="/settings"
          onClick={() => setOpen(false)}
          className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          Manage linked profiles
        </Link>
      </Modal>
    </>
  );
}
