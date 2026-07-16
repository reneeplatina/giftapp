import Link from "next/link";
import { Gift } from "lucide-react";
import { Container } from "@/components/container";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-neutral-900"
        >
          <Gift className="h-5 w-5" aria-hidden="true" />
          Gift Profile
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-neutral-600 hover:text-neutral-900">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-700"
          >
            Sign up
          </Link>
        </nav>
      </Container>
    </header>
  );
}
