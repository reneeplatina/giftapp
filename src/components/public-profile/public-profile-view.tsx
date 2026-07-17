import { HeartCrack, MessageCircleQuestion, Shirt } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/share-modal";
import { ComingSoonModal } from "@/components/coming-soon-modal";
import { TagList } from "@/components/public-profile/tag-list";
import { GiftsByBudget } from "@/components/public-profile/gifts-by-budget";
import { THEME_OPTIONS } from "@/lib/mock/profile";
import type { GiftProfile, ThemeKey, WishlistItem } from "@/types/profile";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-lg font-semibold text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function PublicProfileView({
  profile,
  wishlistItems,
  theme,
  publicUrl,
}: {
  profile: GiftProfile;
  wishlistItems: WishlistItem[];
  theme: ThemeKey;
  publicUrl: string;
}) {
  const accent = THEME_OPTIONS.find((option) => option.key === theme)?.accent;
  const publicItems = wishlistItems.filter(
    (item) => item.isPublic && !item.isArchived,
  );
  const exactWishlistItems = publicItems.filter(
    (item) => item.priority !== "dream_gift",
  );
  const dreamGifts = publicItems.filter(
    (item) => item.priority === "dream_gift",
  );
  const sizeEntries = Object.entries(profile.sizes).filter(
    ([, value]) => value.trim().length > 0,
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className="h-1.5 w-16 rounded-full"
          style={{ backgroundColor: accent ?? "#1c1917" }}
        />
        <Avatar
          name={profile.basicInfo.displayName}
          className="h-20 w-20 text-2xl"
        />
        <div>
          <h1 className="font-display text-3xl font-semibold text-neutral-900">
            {profile.basicInfo.displayName}
          </h1>
        </div>
        <p className="max-w-md text-neutral-600">
          &ldquo;{profile.basicInfo.introduction}&rdquo;
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <ComingSoonModal
            triggerLabel="Help Me Choose a Gift"
            triggerIcon={MessageCircleQuestion}
            triggerVariant="primary"
            modalTitle="AI Gift Assistant — coming soon"
            modalDescription={`Soon you'll be able to chat with an AI assistant for personalized gift ideas based on ${profile.basicInfo.displayName}'s profile. For now, browse the wishlist and favorites below.`}
          />
          <ShareModal
            url={publicUrl}
            title={`${profile.basicInfo.displayName}'s gift profile`}
            triggerLabel="Share"
          />
        </div>
      </div>

      <Section title="My Gift Style">
        <Card>
          <p className="text-neutral-700">{profile.basicInfo.giftStyleSummary}</p>
        </Card>
      </Section>

      <Section title="Favorite colors">
        <TagList items={profile.favoriteColors} />
      </Section>

      <Section title="Interests">
        <TagList items={profile.interests} />
      </Section>

      {exactWishlistItems.length > 0 && (
        <Section title="Exact wishlist items">
          <div className="grid gap-3 sm:grid-cols-2">
            {exactWishlistItems.map((item) => (
              <Card key={item.id} className="flex flex-col gap-1.5">
                <p className="font-medium text-neutral-900">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-neutral-600">{item.description}</p>
                )}
                <Badge variant="outline" className="mt-1 w-fit">
                  {item.category}
                </Badge>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {profile.privacy.showDreamGiftsPublicly && dreamGifts.length > 0 && (
        <Section title="Dream gifts">
          <div className="grid gap-3 sm:grid-cols-2">
            {dreamGifts.map((item) => (
              <Card key={item.id} className="flex flex-col gap-1.5">
                <p className="font-medium text-neutral-900">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-neutral-600">{item.description}</p>
                )}
                <Badge variant="neutral" className="mt-1 w-fit">
                  Dream gift
                </Badge>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {publicItems.length > 0 && (
        <Section title="Gifts by budget">
          <GiftsByBudget items={publicItems} />
        </Section>
      )}

      {profile.privacy.showSizesPublicly && sizeEntries.length > 0 && (
        <Section title="Sizes">
          <Card className="flex flex-wrap gap-x-6 gap-y-2">
            {sizeEntries.map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <Shirt className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                <span className="text-sm text-neutral-600 capitalize">
                  {label.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span className="text-sm font-medium text-neutral-900">
                  {value}
                </span>
              </div>
            ))}
          </Card>
        </Section>
      )}

      <Section title="Favorite stores">
        <TagList items={profile.favoriteStores} />
      </Section>

      <Section title="Digital gifts">
        <TagList items={profile.digitalGifts} />
      </Section>

      {profile.privacy.showAvoidListPublicly &&
        profile.thingsToAvoid.length > 0 && (
          <Section title="Things to avoid">
            <Card className="flex flex-col gap-2">
              {profile.thingsToAvoid.map((thing) => (
                <div key={thing} className="flex items-start gap-2">
                  <HeartCrack
                    className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-neutral-700">{thing}</span>
                </div>
              ))}
            </Card>
          </Section>
        )}

      <div className="flex flex-col items-center gap-3 rounded-2xl bg-cream px-6 py-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">
          Create Your Own Gift Profile
        </h2>
        <p className="max-w-md text-sm text-neutral-600">
          Make gift-giving easier for the people who care about you. Add your
          favorites, sizes, interests, and wishlist items, then share your
          personal link with friends and family.
        </p>
        <Button href="/signup">Create My Free Profile</Button>
        <p className="text-xs text-neutral-500">
          No payment. No shopping account required.
        </p>
      </div>
    </div>
  );
}
