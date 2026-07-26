import { Gift as GiftIcon, Link2, PencilLine } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

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
            One profile. Better gifts. Less guessing.
          </h1>
          <p className="max-w-md text-base text-neutral-600 sm:text-lg">
            Build a free gift profile with your sizes, favorites, and
            wishlist. Share one link with friends and family so they always
            know what to get you.
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

        <div className="flex justify-center">
          <div className="w-full max-w-xs rounded-[2.5rem] border border-neutral-300 bg-cream p-3 shadow-sm">
            <div className="rounded-[2rem] border border-neutral-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <Avatar name="Renee" className="h-12 w-12 text-base" />
                <div>
                  <p className="font-display text-lg font-semibold text-neutral-900">
                    Renee
                  </p>
                  <Badge variant="outline">Published</Badge>
                </div>
              </div>
              <p className="mt-4 text-sm text-neutral-600">
                &ldquo;Shopping for me? Here are some things I genuinely love,
                use, and would be excited to receive.&rdquo;
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Cozy gaming", "Technology", "AI tools"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-neutral-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Top of the wishlist
                </p>
                <p className="mt-1 text-sm font-medium text-neutral-900">
                  Mechanical keyboard
                </p>
              </div>
            </div>
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
