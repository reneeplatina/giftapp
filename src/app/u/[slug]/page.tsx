"use client";

import { use } from "react";
import Link from "next/link";
import { Gift, SearchX } from "lucide-react";
import { Container } from "@/components/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { PublicProfileView } from "@/components/public-profile/public-profile-view";
import { useProfile } from "@/context/profile-context";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { profile, wishlistItems, theme, publicUrl } = useProfile();
  const found = profile.basicInfo.slug === slug;

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
      <main className="flex-1 py-10">
        <Container>
          {found ? (
            <PublicProfileView
              profile={profile}
              wishlistItems={wishlistItems}
              theme={theme}
              publicUrl={publicUrl}
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
