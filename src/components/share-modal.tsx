"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ShareModal({
  url,
  title,
  triggerLabel = "Share profile",
  triggerVariant = "secondary",
}: {
  url: string;
  title: string;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "outline" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // The visitor cancelled the native share sheet — nothing to do.
    }
  }

  return (
    <>
      <Button variant={triggerVariant} onClick={() => setOpen(true)}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        {triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Share this gift profile"
        description="Anyone with this link can view the profile — no account required."
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3">
            <p className="flex-1 truncate text-sm text-neutral-700">{url}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleCopy} className="flex-1">
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy link"}
            </Button>
            {canNativeShare && (
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="flex-1"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                More options
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
