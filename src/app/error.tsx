"use client";

import { useEffect } from "react";
import { NetworkErrorState } from "@/components/network-error-state";

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <NetworkErrorState retry={unstable_retry} />;
}
