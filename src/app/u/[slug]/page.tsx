import Link from "next/link";
import { Gift, SearchX } from "lucide-react";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PublicProfileView } from "@/components/public-profile/public-profile-view";
import { THEME_OPTIONS } from "@/lib/mock/profile";
import { getPublicProfileBySlug } from "@/lib/profile/public-dal";
import { getSiteUrl } from "@/lib/site-url";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loaded = await getPublicProfileBySlug(slug);
  const background = loaded
    ? THEME_OPTIONS.find((option) => option.key === loaded.theme)?.background
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
      <main
        className="flex-1 py-10"
        style={background ? { backgroundColor: background } : undefined}
      >
        <Container>
          {loaded ? (
            <PublicProfileView
              profile={loaded.profile}
              wishlistItems={loaded.wishlistItems}
              theme={loaded.theme}
              publicUrl={`${getSiteUrl()}/u/${slug}`}
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
