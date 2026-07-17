"use client";

import { Eye, PencilLine } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicProfileView } from "@/components/public-profile/public-profile-view";
import { useProfile } from "@/context/profile-context";
import type { ProfileStatus } from "@/types/profile";

const STATUS_LABEL: Record<ProfileStatus, string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
};

const STATUS_VARIANT: Record<ProfileStatus, "success" | "warning" | "outline"> = {
  draft: "warning",
  published: "success",
  hidden: "outline",
};

export default function PreviewPage() {
  const { profile, wishlistItems, theme, publicUrl } = useProfile();

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-cream/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-neutral-600" aria-hidden="true" />
          <p className="text-sm text-neutral-700">
            This is exactly what visitors will see at{" "}
            <span className="font-medium text-neutral-900">{publicUrl}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[profile.privacy.status]}>
            {STATUS_LABEL[profile.privacy.status]}
          </Badge>
          <Button href="/profile/edit" variant="outline" size="sm">
            <PencilLine className="h-4 w-4" aria-hidden="true" />
            Edit
          </Button>
        </div>
      </div>

      <PublicProfileView
        profile={profile}
        wishlistItems={wishlistItems}
        theme={theme}
        publicUrl={publicUrl}
      />
    </Container>
  );
}
