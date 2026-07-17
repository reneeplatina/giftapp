"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  ListChecks,
  MessageCircleQuestion,
  Palette,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ShareModal } from "@/components/share-modal";
import { ComingSoonModal } from "@/components/coming-soon-modal";
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

export default function DashboardPage() {
  const { profile, completionPercent, publicUrl } = useProfile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Container className="flex flex-col gap-6 py-8">
        <LoadingSkeleton className="h-8 w-64" aria-label="Loading dashboard" />
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-48 w-full" />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Welcome back, {profile.basicInfo.displayName}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Here&apos;s how your gift profile is coming along.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={STATUS_VARIANT[profile.privacy.status]}>
            {STATUS_LABEL[profile.privacy.status]}
          </Badge>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={publicUrl} />
            <ShareModal url={publicUrl} title={`${profile.basicInfo.displayName}'s gift profile`} />
          </div>
        </div>
        <ProgressBar value={completionPercent} label="Profile completeness" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <ComingSoonModal
          triggerLabel="Continue AI Interview"
          triggerIcon={MessageCircleQuestion}
          modalTitle="AI interview coming soon"
          modalDescription="A guided, conversational way to build your profile is planned for a later phase. For now, use Edit Profile to fill things in yourself."
        />
        <Button href="/profile/edit" variant="secondary">
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          Edit Profile
        </Button>
        <Button href="/wishlist" variant="secondary">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Manage Wishlist
        </Button>
        <ComingSoonModal
          triggerLabel="Get AI Gift Ideas"
          triggerIcon={Sparkles}
          modalTitle="AI gift ideas coming soon"
          modalDescription="An assistant that suggests gift ideas from your profile is planned for a later phase."
        />
        <Button href="/themes" variant="secondary">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Choose Theme
        </Button>
        <Button href="/preview" variant="secondary">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Preview Profile
        </Button>
      </div>
    </Container>
  );
}
