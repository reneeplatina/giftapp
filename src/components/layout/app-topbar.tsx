import Link from "next/link";
import { Gift } from "lucide-react";
import { Container } from "@/components/container";
import { SignOutButton } from "@/components/sign-out-button";

export function AppTopBar() {
  return (
    <header className="border-b border-neutral-200 bg-white md:hidden">
      <Container className="flex h-14 items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-display text-base font-semibold text-neutral-900"
        >
          <Gift className="h-4 w-4" aria-hidden="true" />
          Gift Profile
        </Link>
        <SignOutButton className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100" />
      </Container>
    </header>
  );
}
