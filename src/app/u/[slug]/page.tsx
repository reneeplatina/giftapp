import Link from "next/link";
import type { Metadata } from "next";
import { Gift, SearchX } from "lucide-react";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PublicProfileView } from "@/components/public-profile/public-profile-view";
import { THEME_OPTIONS } from "@/lib/mock/profile";
import { getPublicProfileBySlug } from "@/lib/profile/public-dal";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await getPublicProfileBySlug(slug);

  if (!loaded) {
    return { title: "Profile not found — Gift Profile" };
  }

  const title = `GIFT ME! 🎁 — ${loaded.profile.basicInfo.displayName}'s Gift Profile`;
  const description =
    loaded.profile.basicInfo.introduction ||
    `See ${loaded.profile.basicInfo.displayName}'s sizes, favorites, and wishlist — all in one place.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loaded = await getPublicProfileBySlug(slug);
  const activeTheme = loaded
    ? THEME_OPTIONS.find((option) => option.key === loaded.theme)
    : undefined;
  const backgroundStyle = activeTheme?.gradient
    ? { backgroundImage: activeTheme.gradient }
    : activeTheme
      ? { backgroundColor: activeTheme.background }
      : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <Container className="flex h-16 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold text-neutral-900"
          >
            <Gift className="h-5 w-5" aria-hidden="true" />
            Gift Profile
          </Link>
        </Container>
      </header>
      <main className="flex-1 py-10" style={backgroundStyle}>
        <Container>
          {loaded ? (
            <PublicProfileView
              profile={loaded.profile}
              wishlistItems={loaded.wishlistItems}
              theme={loaded.theme}
              publicUrl={`${getSiteUrl()}/u/${slug}`}
              linkedProfiles={loaded.linkedProfiles}
              images={loaded.images}
            />
          ) : (
            <EmptyState
              icon={SearchX}
              title="Profile not found"
              description={`There's no published gift profile at "/u/${slug}". Double-check the link, or create your own.`}
            >
              <Button href="/signup" size="sm">
                Create My Free Profile
              </Button>
            </EmptyState>
          )}
        </Container>
      </main>
    </div>
  );
}
