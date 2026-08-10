import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/container";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ShareModal } from "@/components/share-modal";
import { DashboardLinkedProfiles } from "@/components/dashboard/linked-profiles-card";
import { HowItWorks } from "@/components/how-it-works";
import { requireAuthUser } from "@/lib/auth/dal";
import { getActiveProfileId } from "@/lib/profile/active";
import { createClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/lib/profile/dal";
import { getManagedProfiles } from "@/lib/profile/managed-dal";
import { SECTION_TS_KEYS } from "@/lib/profile/section-keys";
import { getSiteUrl } from "@/lib/site-url";
import { isAdminEmail } from "@/lib/admin";
import type { ProfileStatus, ThemeKey } from "@/types/profile";

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

interface NextStep {
  label: string;
  href: string;
}

async function getCompletion(
  profileId: string,
  introduction: string,
): Promise<{ percent: number; nextStep: NextStep | null }> {
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

  const hasIntroduction = introduction.trim().length > 0;
  const hasWishlistItem = (wishlistCount ?? 0) > 0;
  const filledSectionCount = sectionCount ?? 0;

  const checks = [
    hasIntroduction,
    hasWishlistItem,
    ...Array.from(
      { length: SECTION_TS_KEYS.length },
      (_, i) => i < filledSectionCount,
    ),
  ];
  const percent = Math.round(
    (checks.filter(Boolean).length / checks.length) * 100,
  );

  let nextStep: NextStep | null = null;
  if (!hasIntroduction) {
    nextStep = { label: "Write a short introduction", href: "/profile/edit" };
  } else if (!hasWishlistItem) {
    nextStep = { label: "Add a wishlist item", href: "/wishlist" };
  } else if (filledSectionCount === 0) {
    nextStep = { label: "Pick a few interests", href: "/profile/edit" };
  }

  return { percent, nextStep };
}

export default async function DashboardPage() {
  const user = await requireAuthUser("/dashboard");
  const activeProfileId = await getActiveProfileId();
  const isManagedProfileActive = activeProfileId !== user.id;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", activeProfileId ?? user.id)
    .maybeSingle();

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

  const [{ percent: completionPercent, nextStep }, avatarUrl, managedProfiles] =
    await Promise.all([
      getCompletion(profile.id, profile.introduction),
      getAvatarSignedUrl(profile.avatar_path),
      getManagedProfiles(),
    ]);
  const otherProfiles = managedProfiles.filter((p) => p.id !== activeProfileId);
  const publicUrl = `${getSiteUrl()}/u/${profile.slug}`;

  return (
    <Container className="flex flex-col gap-6 py-8">
      {isManagedProfileActive && (
        <p className="rounded-xl bg-neutral-100 px-4 py-2 text-sm text-neutral-700">
          You&apos;re managing <strong>{profile.display_name}</strong>&apos;s
          profile. Switch back to your own profile from the menu anytime.
        </p>
      )}
      <div className="flex items-center gap-4">
        <Avatar
          name={profile.display_name}
          src={avatarUrl ?? undefined}
          emoji={profile.avatar_emoji ?? undefined}
          emojiBg={profile.avatar_emoji_bg ?? undefined}
          theme={profile.default_theme as ThemeKey}
          className="h-14 w-14 text-lg"
        />
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900">
            {isManagedProfileActive
              ? `${profile.display_name}'s profile`
              : `Welcome back, ${profile.display_name}`}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Here&apos;s how {isManagedProfileActive ? "this" : "your"} gift
            profile is coming along.
          </p>
        </div>
      </div>

      {isAdminEmail(user.email) && (
        <Link
          href="/admin"
          className="self-start text-sm font-medium text-neutral-600 underline"
        >
          View signups &amp; feedback →
        </Link>
      )}

      {nextStep && (
        <Card className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-neutral-900">
            How GiftMe works
          </p>
          <HowItWorks />
        </Card>
      )}

      <DashboardLinkedProfiles profiles={otherProfiles} />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={STATUS_VARIANT[profile.status]}>
            {STATUS_LABEL[profile.status]}
          </Badge>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={publicUrl} />
            <ShareModal url={publicUrl} title={`GIFT ME! 🎁 — ${profile.display_name}'s gift profile`} />
          </div>
        </div>
        <ProgressBar value={completionPercent} label="Profile completeness" />
        {nextStep && (
          <p className="text-sm text-neutral-600">
            Next:{" "}
            <Link
              href={nextStep.href}
              className="font-medium text-neutral-900 underline"
            >
              {nextStep.label}
            </Link>
          </p>
        )}
      </Card>

      <Card className="flex flex-col items-center gap-3 border-neutral-900 bg-neutral-900 py-8 text-center">
        <Sparkles className="h-8 w-8 text-white" aria-hidden="true" />
        <p className="font-display text-lg font-semibold text-white">AI Gift Builder</p>
        <p className="max-w-sm text-sm text-neutral-300">
          {isManagedProfileActive
            ? `One chat that gets to know ${profile.display_name} and suggests gifts as it goes — approve what you like, skip the rest.`
            : "One chat that gets to know you and suggests gifts as it goes — approve what you like, skip the rest."}
        </p>
        <Button href="/interview" variant="secondary" size="sm">
          Open AI Gift Builder
        </Button>
      </Card>
    </Container>
  );
}
