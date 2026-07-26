"use client";

import { WifiOff } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

export function NetworkErrorState({
  retry,
}: {
  retry: () => void;
}) {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <WifiOff className="h-8 w-8 text-neutral-400" aria-hidden="true" />
      <h1 className="font-display text-xl font-semibold text-neutral-900">
        We couldn&apos;t reach the server
      </h1>
      <p className="max-w-sm text-sm text-neutral-600">
        Check your connection and try again. If this keeps happening, the
        server may be temporarily unavailable.
      </p>
      <Button onClick={retry} size="sm">
        Try again
      </Button>
    </Container>
  );
}
