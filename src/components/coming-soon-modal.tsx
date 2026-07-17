"use client";

import { useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ComingSoonModal({
  triggerLabel,
  triggerIcon = <Sparkles className="h-4 w-4" aria-hidden="true" />,
  triggerVariant = "outline",
  modalTitle,
  modalDescription,
}: {
  triggerLabel: string;
  triggerIcon?: ReactNode;
  triggerVariant?: "primary" | "secondary" | "outline" | "ghost";
  modalTitle: string;
  modalDescription: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={triggerVariant} onClick={() => setOpen(true)}>
        {triggerIcon}
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
