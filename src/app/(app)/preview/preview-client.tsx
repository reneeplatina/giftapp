"use client";

import { Eye, PencilLine } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { ShareRow } from "@/components/share-row";
import { PublicProfileView } from "@/components/public-profile/public-profile-view";
import { useProfile } from "@/context/profile-context";
import { THEME_OPTIONS } from "@/lib/mock/profile";

export function PreviewClient() {
  const { profile, wishlistItems, theme, publicUrl } = useProfile();
  const isPublished = profile.privacy.status === "published";
  const activeTheme = THEME_OPTIONS.find((option) => option.key === theme);
  const backgroundStyle = activeTheme?.gradient
    ? { backgroundImage: activeTheme.gradient }
    : activeTheme
      ? { backgroundColor: activeTheme.background }
      : undefined;

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-cream/50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-neutral-600" aria-hidden="true" />
            <p className="text-sm text-neutral-700">
              {isPublished
                ? "This is exactly what visitors will see at "
                : "This is how it will look once published, at "}
              <span className="font-medium text-neutral-900">{publicUrl}</span>
            </p>
          </div>
          <Button href="/profile/edit" variant="outline" size="sm">
            <PencilLine className="h-4 w-4" aria-hidden="true" />
            Edit
          </Button>
        </div>
        <ShareRow />
      </div>

      <div className="rounded-2xl px-4 py-8 sm:px-8" style={backgroundStyle}>
        <PublicProfileView
          profile={profile}
          wishlistItems={wishlistItems}
          theme={theme}
          publicUrl={publicUrl}
          isPreview
        />
      </div>
    </Container>
  );
}
