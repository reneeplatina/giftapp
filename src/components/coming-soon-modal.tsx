"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ComingSoonModal({
  triggerLabel,
  triggerIcon: TriggerIcon = Sparkles,
  triggerVariant = "outline",
  modalTitle,
  modalDescription,
}: {
  triggerLabel: string;
  triggerIcon?: LucideIcon;
  triggerVariant?: "primary" | "secondary" | "outline" | "ghost";
  modalTitle: string;
  modalDescription: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={triggerVariant} onClick={() => setOpen(true)}>
        <TriggerIcon className="h-4 w-4" aria-hidden="true" />
        {triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={modalTitle}
        description={modalDescription}
      />
    </>
  );
}
