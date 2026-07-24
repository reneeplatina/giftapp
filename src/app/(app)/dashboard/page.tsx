import {
  Eye,
  ListChecks,
  Palette,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ShareModal } from "@/components/share-modal";
import { getCurrentProfile, requireAuthUser } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/lib/profile/dal";
import { getSiteUrl } from "@/lib/site-url";
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

const KNOWN_SECTION_COUNT = 12;

async function getCompletion(profileId: string, introduction: string) {
  const supabase = await createClient();
  const [{ count: sectionCount }, { count: wishlistCount }] = await Promise.all([
    supabase
      .from("profile_sections")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId),
    supabase
      .from("wishlist_items")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId),
  ]);

  const checks = [
    introduction.trim().length > 0,
    (wishlistCount ?? 0) > 0,
    ...Array.from({ length: KNOWN_SECTION_COUNT }, (_, i) => i < (sectionCount ?? 0)),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export default async function DashboardPage() {
  await requireAuthUser("/dashboard");
  const profile = await getCurrentProfile();

  if (!profile) {
    // requireAuthUser() above guarantees a session exists; a missing
    // profile row here would mean account/profile creation failed
    // partway through — send them back to finish onboarding.
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <p className="text-neutral-600">
          We couldn&apos;t find your profile yet.
        </p>
        <Button href="/onboarding">Continue setup</Button>
      </Container>
    );
  }

  const completionPercent = await getCompletion(
    profile.id,
    profile.introduction,
  );
  const publicUrl = `${getSiteUrl()}/u/${profile.slug}`;
  const supabase = await createClient();
  const avatarUrl = await getAvatarSignedUrl(supabase, profile.avatar_path);

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div className="flex items-center gap-4">
        <Avatar
          name={profile.display_name}
          src={avatarUrl ?? undefined}
          className="h-14 w-14 text-lg"
        />
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900">
            Welcome back, {profile.display_name}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Here&apos;s how your gift profile is coming along.
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={STATUS_VARIANT[profile.status]}>
            {STATUS_LABEL[profile.status]}
          </Badge>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={publicUrl} />
            <ShareModal url={publicUrl} title={`${profile.display_name}'s gift profile`} />
          </div>
        </div>
        <ProgressBar value={completionPercent} label="Profile completeness" />
      </Card>

      <Card className="flex flex-col items-center gap-3 border-neutral-900 bg-neutral-900 py-8 text-center">
        <Sparkles className="h-8 w-8 text-white" aria-hidden="true" />
        <p className="font-display text-lg font-semibold text-white">AI Gift Builder</p>
        <p className="max-w-sm text-sm text-neutral-300">
          One chat that gets to know you and suggests gifts as it goes —
          approve what you like, skip the rest.
        </p>
        <Button href="/interview" variant="secondary" size="sm">
          Open AI Gift Builder
        </Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button href="/profile/edit" variant="secondary">
          <PencilLine className="h-4 w-4" aria-hidden="true" />
          Edit Profile
        </Button>
        <Button href="/wishlist" variant="secondary">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Manage Wishlist
        </Button>
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
