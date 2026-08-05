import { Container } from "@/components/container";
import { requireAuthUser } from "@/lib/auth/dal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BasicInfoSection } from "@/components/profile-builder/basic-info-section";
import { SizesSection } from "@/components/profile-builder/sizes-section";
import { ChipListSection } from "@/components/profile-builder/chip-list-section";
import { getFullProfileForEditing } from "@/lib/profile/dal";
import {
  ART_AND_DESIGN_OPTIONS,
  CARS_AND_GARAGE_OPTIONS,
  CLOTHING_AND_SHOES_OPTIONS,
  COLOR_OPTIONS,
  CREATIVITY_OPTIONS,
  DIGITAL_GIFT_OPTIONS,
  DIY_AND_CRAFTING_OPTIONS,
  EXPERIENCE_OPTIONS,
  FAITH_OPTIONS,
  FITNESS_AND_WELLNESS_OPTIONS,
  FOOD_AND_DRINK_OPTIONS,
  GIFT_CARDS_AND_SUBSCRIPTIONS_OPTIONS,
  HOME_AND_LIFESTYLE_OPTIONS,
  INTEREST_OPTIONS,
  KIDS_TOYS_AND_SENSORY_OPTIONS,
  MOVIES_AND_SHOWS_OPTIONS,
  OUTDOORS_OPTIONS,
  READING_OPTIONS,
  SPORTS_AND_COMBAT_OPTIONS,
  STORE_OPTIONS,
  TECH_AND_GAMING_OPTIONS,
} from "@/lib/mock/profile";

export default async function ProfileEditPage() {
  await requireAuthUser("/profile/edit");
  const loaded = await getFullProfileForEditing();

  if (loaded?.isSimpleProfile) {
    return (
      <Container className="flex flex-col gap-6 py-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-neutral-900">
            Edit profile
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            This is a simple profile — just a name, photo, and wishlist.
          </p>
        </div>

        <Card>
          <BasicInfoSection />
        </Card>

        <Card className="flex flex-col items-start gap-2">
          <h2 className="font-display text-lg font-semibold text-neutral-900">
            Wishlist
          </h2>
          <p className="text-sm text-neutral-600">
            Add the gifts they&apos;d like, with a price range — that&apos;s
            what shows on their shared page.
          </p>
          <Button href="/wishlist" size="sm">
            Go to wishlist
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Edit your profile
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Fill in as much or as little as you like — changes save as you go.
        </p>
      </div>

      <Accordion>
        <AccordionItem title="Basic information" defaultOpen>
          <BasicInfoSection />
        </AccordionItem>
        <AccordionItem title="Favorite colors">
          <ChipListSection
            profileKey="favoriteColors"
            label="Favorite colors"
            options={COLOR_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Interests and hobbies">
          <ChipListSection
            profileKey="interests"
            label="Interests and hobbies"
            options={INTEREST_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Sizes">
          <SizesSection />
        </AccordionItem>
        <AccordionItem title="Food and drinks">
          <ChipListSection
            profileKey="foodAndDrinks"
            label="Food and drinks"
            options={FOOD_AND_DRINK_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Favorite stores and brands">
          <ChipListSection
            profileKey="favoriteStores"
            label="Favorite stores and brands"
            options={STORE_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Technology and gaming">
          <ChipListSection
            profileKey="techAndGaming"
            label="Technology and gaming"
            options={TECH_AND_GAMING_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Home and lifestyle">
          <ChipListSection
            profileKey="homeAndLifestyle"
            label="Home and lifestyle"
            options={HOME_AND_LIFESTYLE_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Creativity">
          <ChipListSection
            profileKey="creativity"
            label="Creativity"
            options={CREATIVITY_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Fitness and wellness">
          <ChipListSection
            profileKey="fitnessAndWellness"
            label="Fitness and wellness"
            options={FITNESS_AND_WELLNESS_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Experiences">
          <ChipListSection
            profileKey="experiences"
            label="Experiences"
            options={EXPERIENCE_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Digital gifts and subscriptions">
          <ChipListSection
            profileKey="digitalGifts"
            label="Digital gifts and subscriptions"
            options={DIGITAL_GIFT_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Sports and combat">
          <ChipListSection
            profileKey="sportsAndCombat"
            label="Sports and combat"
            options={SPORTS_AND_COMBAT_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Outdoors">
          <ChipListSection
            profileKey="outdoorsAndGuns"
            label="Outdoors"
            options={OUTDOORS_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Faith">
          <ChipListSection
            profileKey="faithAndValues"
            label="Faith"
            options={FAITH_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Clothing and shoes">
          <ChipListSection
            profileKey="clothingAndShoes"
            label="Clothing and shoes"
            hint="Sizes go in the Sizes section above — this is for styles and brands."
            options={CLOTHING_AND_SHOES_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Movies and shows">
          <ChipListSection
            profileKey="moviesAndShows"
            label="Movies and shows"
            options={MOVIES_AND_SHOWS_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Cars and garage">
          <ChipListSection
            profileKey="carsAndGarage"
            label="Cars and garage"
            options={CARS_AND_GARAGE_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="DIY and crafting">
          <ChipListSection
            profileKey="diyAndCrafting"
            label="DIY and crafting"
            options={DIY_AND_CRAFTING_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Art and design">
          <ChipListSection
            profileKey="artAndDesign"
            label="Art and design"
            options={ART_AND_DESIGN_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Reading">
          <ChipListSection
            profileKey="booksAndReading"
            label="Reading"
            options={READING_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Gift cards and subscriptions">
          <ChipListSection
            profileKey="giftCardsAndSubscriptions"
            label="Gift cards and subscriptions"
            hint="Pick the ones you'd actually use — mention a preferred amount in your gift style summary or wishlist notes."
            options={GIFT_CARDS_AND_SUBSCRIPTIONS_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Kids toys and sensory">
          <ChipListSection
            profileKey="kidsToysAndSensory"
            label="Kids toys and sensory"
            options={KIDS_TOYS_AND_SENSORY_OPTIONS}
          />
        </AccordionItem>
        <AccordionItem title="Things to avoid">
          <ChipListSection
            profileKey="thingsToAvoid"
            label="Things to avoid"
            hint="Dislikes, allergies, or things you already own."
            options={[]}
          />
        </AccordionItem>
      </Accordion>
    </Container>
  );
}
