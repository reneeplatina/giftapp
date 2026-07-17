"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      aria-labelledby="modal-title"
      className={cn(
        "w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h2
          id="modal-title"
          className="font-display text-xl font-semibold text-neutral-900"
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {description && (
        <p className="mt-2 text-sm text-neutral-600">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </dialog>
  );
}
