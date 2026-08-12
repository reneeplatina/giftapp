import Link from "next/link";
import { ListChecks, Sparkles, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAuthUser } from "@/lib/auth/dal";

const CHOICES: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
}[] = [
  {
    icon: Sparkles,
    title: "Let AI help",
    description:
      "Answer a few questions in one chat, and it fills in your profile and suggests gifts as you go.",
    href: "/interview",
    cta: "Start the chat",
  },
  {
    icon: ListChecks,
    title: "Add a wishlist item",
    description:
      "Know what you want already? Add your first gift idea and share your link.",
    href: "/wishlist",
    cta: "Add an item",
  },
  {
    icon: UserPlus,
    title: "Set up a kids profile",
    description:
      "Make a profile for a child, or anyone who won't be signing up themselves.",
    href: "/settings#linked-profiles",
    cta: "Create a profile",
  },
];

export default async function OnboardingPage() {
  await requireAuthUser("/onboarding");

  return (
    <Container className="flex flex-1 flex-col justify-center gap-6 py-12">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
          Where would you like to start?
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Pick one — you can do the others later, and change anything anytime.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3">
        {CHOICES.map(({ icon: Icon, title, description, href, cta }) => (
          <Card key={title} className="flex flex-col items-center gap-2 text-center">
            <Icon className="h-7 w-7 text-neutral-700" aria-hidden="true" />
            <p className="font-display text-lg font-semibold text-neutral-900">
              {title}
            </p>
            <p className="text-sm text-neutral-600">{description}</p>
            {/* mt-auto pins every button to the bottom of its card, so
                they line up across the row even though the descriptions
                run to different lengths. */}
            <Button href={href} size="sm" className="mt-auto w-full">
              {cta}
            </Button>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-neutral-600">
        You can also{" "}
        <Link
          href="/profile/edit"
          className="font-medium text-neutral-900 underline"
        >
          add a profile photo
        </Link>{" "}
        or{" "}
        <Link href="/themes" className="font-medium text-neutral-900 underline">
          pick a theme
        </Link>{" "}
        anytime.
      </p>

      <p className="text-center">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-neutral-500 underline"
        >
          Skip for now
        </Link>
      </p>
    </Container>
  );
}
