import Link from "next/link";
import { Gift } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold text-neutral-900"
        >
          <Gift className="h-5 w-5" aria-hidden="true" />
          Gift Profile
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-2">
          <Button href="/login" variant="ghost" size="sm">
            Sign in
          </Button>
          <Button href="/signup" size="sm">
            Create my gift profile
          </Button>
        </nav>
      </Container>
    </header>
  );
}
