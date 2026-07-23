"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const DEFAULT_CLASSNAME =
  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100";

function SignOutSubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        className ?? DEFAULT_CLASSNAME,
        "transition-colors active:bg-neutral-200",
        pending && "opacity-60",
      )}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <SignOutSubmitButton className={className} />
    </form>
  );
}
