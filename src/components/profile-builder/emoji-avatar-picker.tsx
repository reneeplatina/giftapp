"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { AVATAR_BG_COLORS, AVATAR_EMOJI_GROUPS } from "@/lib/mock/profile";
import { cn } from "@/lib/utils";

export function EmojiAvatarPicker({
  open,
  onClose,
  onSelect,
  initialColor,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string, color: string) => Promise<void>;
  initialColor?: string | null;
}) {
  const [color, setColor] = useState(initialColor || AVATAR_BG_COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handlePick(emoji: string) {
    setSaving(true);
    await onSelect(emoji, color);
    setSaving(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose an emoji avatar"
      description="Pick a background color, then tap an emoji to use it as your profile picture."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {AVATAR_BG_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              aria-label={`Use background color ${option}`}
              aria-pressed={color === option}
              className={cn(
                "h-7 w-7 rounded-full ring-2 ring-offset-2 transition-shadow",
                color === option ? "ring-neutral-900" : "ring-transparent",
              )}
              style={{ backgroundColor: option }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {AVATAR_EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-500">
                {group.label}
              </span>
              <div className="grid grid-cols-8 gap-1.5">
                {group.emoji.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handlePick(emoji)}
                    disabled={saving}
                    aria-label={`Use ${emoji} as your avatar`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-neutral-100 disabled:opacity-50"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {saving && (
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Saving…
          </div>
        )}
      </div>
    </Modal>
  );
}
