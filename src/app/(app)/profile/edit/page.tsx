import { Container } from "@/components/container";
import { requireAuthUser } from "@/lib/auth/dal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { BasicInfoSection } from "@/components/profile-builder/basic-info-section";
import { SizesSection } from "@/components/profile-builder/sizes-section";
import { ChipListSection } from "@/components/profile-builder/chip-list-section";
import {
  COLOR_OPTIONS,
  CREATIVITY_OPTIONS,
  DIGITAL_GIFT_OPTIONS,
  EXPERIENCE_OPTIONS,
  FITNESS_AND_WELLNESS_OPTIONS,
  FOOD_AND_DRINK_OPTIONS,
  HOME_AND_LIFESTYLE_OPTIONS,
  INTEREST_OPTIONS,
  STORE_OPTIONS,
  TECH_AND_GAMING_OPTIONS,
} from "@/lib/mock/profile";

export default async function ProfileEditPage() {
  await requireAuthUser("/profile/edit");

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
