import Link from "next/link";
import { Gift } from "lucide-react";
import { Container } from "@/components/container";
import { SignOutButton } from "@/components/sign-out-button";
import { ProfileSwitcher } from "@/components/layout/profile-switcher";
import type { ProfileSwitcherData } from "@/lib/profile/managed-dal";

export function AppTopBar({ switcherData }: { switcherData: ProfileSwitcherData }) {
  return (
    <header className="border-b border-neutral-200 bg-white md:hidden">
      <Container className="flex h-14 items-center justify-between gap-2">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 font-display text-base font-semibold text-neutral-900"
        >
          <Gift className="h-4 w-4" aria-hidden="true" />
          Gift Profile
        </Link>
        {switcherData.managed.length > 0 && (
          <ProfileSwitcher data={switcherData} className="w-auto max-w-[45%] py-1" />
        )}
        <SignOutButton className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100" />
      </Container>
    </header>
  );
}
