import Link from "next/link";
import { Cake, HeartCrack, Shirt } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ShareModal } from "@/components/share-modal";
import { GiftAssistantSection } from "@/components/public-profile/gift-assistant-section";
import { TagList } from "@/components/public-profile/tag-list";
import { WishlistTierRow } from "@/components/public-profile/wishlist-tier-row";
import {
  BUDGET_TIER_BY_LEVEL,
  BUDGET_TIER_LABEL,
  BUDGET_TIER_ORDER,
  BUDGET_TIER_SYMBOL,
} from "@/lib/mock/profile";
import { formatBirthdayMonthDay } from "@/lib/format-birthday";
import { SECTION_LABELS } from "@/lib/profile/section-keys";
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
  const birthdayDisplay = profile.basicInfo.birthday
    ? formatBirthdayMonthDay(profile.basicInfo.birthday)
    : null;
  const visibleWishlistItems = wishlistItems.filter(
    (item) => item.isPublic && !item.isArchived,
  );
  const wishlistByTier = BUDGET_TIER_ORDER.map((tier) => ({
    tier,
    items: visibleWishlistItems
      .filter((item) => BUDGET_TIER_BY_LEVEL[item.budgetLevel] === tier)
      .sort(
        (a, b) => BUDGET_ORDER.indexOf(a.budgetLevel) - BUDGET_ORDER.indexOf(b.budgetLevel),
      ),
  })).filter((group) => group.items.length > 0);
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
        {theme === "christmas" && (
          <p aria-hidden="true" className="text-lg tracking-widest">
            🎄 ❄️ 🎁 ❄️ 🎄
          </p>
        )}
        <Avatar
          name={profile.basicInfo.displayName}
          src={profile.basicInfo.avatarUrl ?? undefined}
          emoji={profile.basicInfo.avatarEmoji ?? undefined}
          emojiBg={profile.basicInfo.avatarEmojiBg ?? undefined}
          theme={theme}
          className="h-20 w-20 text-2xl"
        />
        {birthdayDisplay && (
          <p className="-mt-2 flex items-center gap-1 text-sm font-medium text-neutral-500">
            <Cake className="h-4 w-4" aria-hidden="true" />
            {birthdayDisplay}
          </p>
        )}
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
      </div>

      <div className="flex justify-center">
        <Button
          href="/signup"
          className="bg-teal-500 text-black hover:bg-teal-400"
        >
          CREATE MY OWN!
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
                  emoji={linked.avatarEmoji ?? undefined}
                  emojiBg={linked.avatarEmojiBg ?? undefined}
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

      {wishlistByTier.length > 0 && (
        <Section title="Wishlist">
          <div className="flex flex-col gap-5">
            {wishlistByTier.map(({ tier, items }) => (
              <div key={tier} className="flex flex-col gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  <span aria-hidden="true" className="text-base text-emerald-600">
                    {BUDGET_TIER_SYMBOL[tier]}
                  </span>
                  {BUDGET_TIER_LABEL[tier]}
                </h3>
                <WishlistTierRow symbol={BUDGET_TIER_SYMBOL[tier]} items={items} />
              </div>
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

      <div className="flex justify-center">
        <ShareModal
          url={publicUrl}
          title={`GIFT ME! 🎁 — ${profile.basicInfo.displayName}'s gift profile`}
          triggerLabel="Share"
        />
      </div>
    </div>
  );
}
