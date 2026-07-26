"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${name}'s profile photo placeholder`}
        className={cn(
          "flex items-center justify-center rounded-full bg-neutral-900 font-display text-white",
          className,
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name}'s profile photo`}
      onError={() => setFailed(true)}
      className={cn("rounded-full object-cover", className)}
    />
  );
}
