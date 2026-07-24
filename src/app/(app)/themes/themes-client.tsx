"use client";

import { Check } from "lucide-react";
import { Container } from "@/components/container";
import { Card } from "@/components/ui/card";
import { THEME_OPTIONS } from "@/lib/mock/profile";
import { THEME_ICONS } from "@/lib/profile/theme-icons";
import { useProfile } from "@/context/profile-context";
import { cn } from "@/lib/utils";

export function ThemesClient() {
  const { theme, setTheme } = useProfile();
  const activeTheme = THEME_OPTIONS.find((option) => option.key === theme);
  const ActiveThemeIcon = activeTheme ? THEME_ICONS[activeTheme.key] : null;

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Choose a theme
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Pick a background, accent, and icon for your public profile. You
          can change it any time.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {THEME_OPTIONS.map((option) => {
          const selected = option.key === theme;
          const Icon = THEME_ICONS[option.key];
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setTheme(option.key)}
              aria-pressed={selected}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={cn(
                  "relative flex h-14 w-14 items-center justify-center rounded-full ring-2 ring-offset-2 transition-shadow",
                  selected ? "ring-neutral-900" : "ring-transparent",
                )}
                style={{ backgroundColor: option.accent }}
              >
                <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                {selected && (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 ring-2 ring-white">
                    <Check className="h-3 w-3 text-white" aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className="text-xs font-medium text-neutral-700">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {activeTheme && ActiveThemeIcon && (
        <Card
          className="flex items-center gap-3"
          style={{ backgroundColor: activeTheme.background }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: activeTheme.accent }}
          >
            <ActiveThemeIcon className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <p className="text-sm text-neutral-700">
            <strong className="font-medium text-neutral-900">
              {activeTheme.label}
            </strong>{" "}
            is your active theme. Preview it on your public profile.
          </p>
        </Card>
      )}
    </Container>
  );
}
