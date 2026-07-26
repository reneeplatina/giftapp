import { Gift as GiftIcon, Link2, PencilLine } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: PencilLine,
    title: "Build your profile",
    description:
      "Add your sizes, favorite colors, interests, and exact wishlist items.",
  },
  {
    icon: Link2,
    title: "Share one link",
    description:
      "Send your personal link to friends and family — no account needed to view it.",
  },
  {
    icon: GiftIcon,
    title: "Get better gifts",
    description:
      "Everyone who shops for you already knows what you actually want.",
  },
];

export default function HomePage() {
  return (
    <>
      <Container className="flex flex-col gap-12 py-12 sm:py-20">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-lg font-display text-4xl font-semibold leading-tight tracking-tight text-neutral-900 sm:text-5xl">
            Better gifts. Less guessing.
          </h1>
          <p className="max-w-md text-base text-neutral-600 sm:text-lg">
            Build a personalized gift profile with your own wishlist. Share
            with friends and family so they always know what to get you.
          </p>
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button href="/signup" className="w-full sm:w-auto">
              Create My Gift Profile
            </Button>
            <Button href="/login" variant="outline" className="w-full sm:w-auto">
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="font-display text-lg font-semibold text-neutral-900">
                {index + 1}. {step.title}
              </p>
              <p className="text-sm text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl bg-cream px-6 py-10 text-center">
          <Button href="/signup">Create My Gift Profile</Button>
        </div>
      </Container>
    </>
  );
}
