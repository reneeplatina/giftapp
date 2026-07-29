import Link from "next/link";
import { DollarSign, HeartCrack, Shirt } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ShareModal } from "@/components/share-modal";
import { GiftAssistantSection } from "@/components/public-profile/gift-assistant-section";
import { AmazonSearchLink } from "@/components/public-profile/amazon-search-link";
import { TagList } from "@/components/public-profile/tag-list";
import { BUDGET_LABELS, THEME_OPTIONS } from "@/lib/mock/profile";
import { SECTION_LABELS } from "@/lib/profile/section-keys";
import { THEME_ICONS } from "@/lib/profile/theme-icons";
import type { PublicLinkedProfile, PublicProfileImage } from "@/lib/profile/public-dal";
import type { BudgetLevel, GiftProfile, ThemeKey, WishlistItem } from "@/types/profile";

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

const BUDGET_ORDER: BudgetLevel[] = [
  "under_25",
  "25_to_75",
  "75_to_200",
  "over_200",
];

/** Chip-list sections grouped the way a gift-giver thinks, so the public
 * page can tuck them into a few collapsed accordion items instead of a
 * long stack of always-open sections — everyone can still find every
 * category, just without scrolling past all of them to reach the parts
 * that actually matter (the wishlist). */
const DETAIL_GROUPS: {
  title: string;
  keys: Exclude<keyof GiftProfile, "basicInfo" | "sizes" | "thingsToAvoid" | "privacy">[];
}[] = [
  { title: "Style", keys: ["favoriteColors", "clothingAndShoes"] },
  {
    title: "Interests and hobbies",
    keys: [
      "interests",
      "sportsAndCombat",
      "outdoorsAndGuns",
      "fitnessAndWellness",
      "experiences",
      "creativity",
      "artAndDesign",
      "diyAndCrafting",
      "booksAndReading",
      "moviesAndShows",
      "kidsToysAndSensory",
    ],
  },
  { title: "Food and drinks", keys: ["foodAndDrinks"] },
  { title: "Home, tech, and cars", keys: ["homeAndLifestyle", "techAndGaming", "carsAndGarage"] },
  { title: "Faith", keys: ["faithAndValues"] },
  {
    title: "Stores and gift cards",
    keys: ["favoriteStores", "digitalGifts", "giftCardsAndSubscriptions"],
  },
];

export function PublicProfileView({
  profile,
  wishlistItems,
  theme,
  publicUrl,
  linkedProfiles = [],
  images = [],
  isPreview = false,
}: {
  profile: GiftProfile;
  wishlistItems: WishlistItem[];
  theme: ThemeKey;
  publicUrl: string;
  linkedProfiles?: PublicLinkedProfile[];
  images?: PublicProfileImage[];
  isPreview?: boolean;
}) {
  const accent = THEME_OPTIONS.find((option) => option.key === theme)?.accent;
  const ThemeIcon = THEME_ICONS[theme];
  const sortedWishlistItems = wishlistItems
    .filter((item) => item.isPublic && !item.isArchived)
    .slice()
    .sort(
      (a, b) => BUDGET_ORDER.indexOf(a.budgetLevel) - BUDGET_ORDER.indexOf(b.budgetLevel),
    );
  const sizeEntries = Object.entries(profile.sizes).filter(
    ([, value]) => value.trim().length > 0,
  );
  const hasSizes = profile.privacy.sectionVisibility.sizes && sizeEntries.length > 0;

  const visibleGroups = DETAIL_GROUPS.map((group) => ({
    title: group.title,
    keys: group.keys.filter(
      (key) => profile.privacy.sectionVisibility[key] && (profile[key] as string[]).length > 0,
    ),
  })).filter((group) => group.keys.length > 0 || (group.title === "Style" && hasSizes));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: `${accent ?? "#1c1917"}1a` }}
        >
          <ThemeIcon
            className="h-6 w-6"
            style={{ color: accent ?? "#1c1917" }}
            aria-hidden="true"
          />
        </span>
        <Avatar
          name={profile.basicInfo.displayName}
          src={profile.basicInfo.avatarUrl ?? undefined}
          className="h-20 w-20 text-2xl"
        />
        <div>
          <h1 className="font-display text-3xl font-semibold text-neutral-900">
            {profile.basicInfo.displayName}
          </h1>
        </div>
        {profile.basicInfo.introduction.trim().length > 0 && (
          <p className="max-w-md text-neutral-600">
            &ldquo;{profile.basicInfo.introduction}&rdquo;
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <ShareModal
            url={publicUrl}
            title={`GIFT ME! 🎁 — ${profile.basicInfo.displayName}'s gift profile`}
            triggerLabel="Share"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          href="/signup"
          className="bg-teal-500 text-black hover:bg-teal-400"
        >
          CREATE MY GIFTME!
        </Button>
      </div>

      {linkedProfiles.length > 0 && (
        <Section title={`Also gifting for ${profile.basicInfo.displayName}'s family`}>
          <div className="flex flex-wrap gap-3">
            {linkedProfiles.map((linked) => (
              <Link
                key={linked.slug}
                href={`/u/${linked.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 transition-colors hover:border-neutral-400"
              >
                <Avatar
                  name={linked.displayName}
                  src={linked.avatarUrl ?? undefined}
                  className="h-10 w-10 text-sm"
                />
                <span className="font-medium text-neutral-900">
                  {linked.displayName}
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <GiftAssistantSection
        slug={profile.basicInfo.slug}
        displayName={profile.basicInfo.displayName}
        isPreview={isPreview}
      />

      {profile.basicInfo.giftStyleSummary.trim().length > 0 && (
        <Section title="My Gift Style">
          <Card>
            <p className="text-neutral-700">{profile.basicInfo.giftStyleSummary}</p>
          </Card>
        </Section>
      )}

      {sortedWishlistItems.length > 0 && (
        <Section title="Wishlist — cheapest first">
          <div className="grid gap-3 sm:grid-cols-2">
            {sortedWishlistItems.map((item) => (
              <Card key={item.id} className="flex flex-col gap-1.5">
                <p className="font-medium text-neutral-900">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-neutral-600">{item.description}</p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="success" className="font-semibold">
                    <DollarSign className="h-3 w-3" aria-hidden="true" />
                    {BUDGET_LABELS[item.budgetLevel]}
                  </Badge>
                  {item.category && <Badge variant="outline">{item.category}</Badge>}
                  {item.priority === "dream_gift" && (
                    <Badge variant="neutral">Dream gift</Badge>
                  )}
                </div>
                <AmazonSearchLink itemName={item.name} />
              </Card>
            ))}
          </div>
        </Section>
      )}

      {images.length > 0 && (
        <Section title="My images">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
              >
                {image.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Gift idea photo"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {profile.privacy.sectionVisibility.thingsToAvoid &&
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

      {visibleGroups.length > 0 && (
        <Section title={`More about ${profile.basicInfo.displayName}`}>
          <Accordion>
            {visibleGroups.map((group) => (
              <AccordionItem key={group.title} title={group.title}>
                <div className="flex flex-col gap-4">
                  {group.title === "Style" && hasSizes && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-neutral-800">Sizes</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {sizeEntries.map(([label, value]) => (
                          <div key={label} className="flex items-center gap-2">
                            <Shirt
                              className="h-4 w-4 text-neutral-400"
                              aria-hidden="true"
                            />
                            <span className="text-sm text-neutral-600 capitalize">
                              {label.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-sm font-medium text-neutral-900">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {group.keys.map((key) => (
                    <div key={key} className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-neutral-800">
                        {SECTION_LABELS[key]}
                      </p>
                      <TagList items={profile[key] as string[]} />
                    </div>
                  ))}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      )}
    </div>
  );
}
