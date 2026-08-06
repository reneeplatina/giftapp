"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { THEME_OPTIONS } from "@/lib/mock/profile";
import type { ThemeKey } from "@/types/profile";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const CHRISTMAS_CORNER_ICONS = ["❄️", "🎄", "🎁", "⭐"];
const CHRISTMAS_CORNER_POSITIONS: Array<React.CSSProperties> = [
  { top: "-12%", left: "-12%" },
  { top: "-12%", right: "-12%" },
  { bottom: "-12%", left: "-12%" },
  { bottom: "-12%", right: "-12%" },
];

export function Avatar({
  name,
  src,
  emoji,
  emojiBg,
  theme,
  className,
}: {
  name: string;
  src?: string | null;
  emoji?: string | null;
  emojiBg?: string | null;
  theme?: ThemeKey | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const themeOption = theme ? THEME_OPTIONS.find((option) => option.key === theme) : undefined;
  const isChristmas = theme === "christmas";
  const ringStyle = themeOption
    ? { boxShadow: `0 0 0 3px white, 0 0 0 5px ${themeOption.accent}` }
    : undefined;

  let content: React.ReactNode;

  if (src && !failed) {
    content = (
      <span
        style={ringStyle}
        className={cn("relative block overflow-hidden rounded-full", className)}
      >
        <Image
          src={src}
          alt={`${name}'s profile photo`}
          onError={() => setFailed(true)}
          fill
          sizes="80px"
          className="object-cover"
        />
      </span>
    );
  } else if (emoji) {
    content = (
      <div
        role="img"
        aria-label={`${name}'s profile emoji`}
        className={cn(
          "flex items-center justify-center rounded-full leading-none",
          className,
        )}
        style={{ backgroundColor: emojiBg ?? "#78716c", ...ringStyle }}
      >
        {emoji}
      </div>
    );
  } else {
    content = (
      <div
        role="img"
        aria-label={`${name}'s profile photo placeholder`}
        style={ringStyle}
        className={cn(
          "flex items-center justify-center rounded-full bg-neutral-900 font-display text-white",
          className,
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  if (!isChristmas) {
    return content;
  }

  return (
    <span className="relative inline-block">
      {content}
      {CHRISTMAS_CORNER_POSITIONS.map((position, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="absolute text-sm leading-none drop-shadow-sm"
          style={position}
        >
          {CHRISTMAS_CORNER_ICONS[index]}
        </span>
      ))}
    </span>
  );
}
