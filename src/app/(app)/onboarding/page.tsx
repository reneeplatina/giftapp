import { PencilLine, Sparkles } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ComingSoonModal } from "@/components/coming-soon-modal";
import { requireAuthUser } from "@/lib/auth/dal";

export default async function OnboardingPage() {
  await requireAuthUser("/onboarding");

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-8 py-16 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
          How would you like to build your gift profile?
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          You can switch methods or edit anything later.
        </p>
      </div>

      <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
        <Card className="flex flex-col items-center gap-3 py-8">
          <Sparkles className="h-8 w-8 text-neutral-400" aria-hidden="true" />
          <p className="font-display text-lg font-semibold text-neutral-900">
            Build It With AI
          </p>
          <p className="text-sm text-neutral-500">
            A guided conversation that fills in your profile as you chat.
          </p>
          <ComingSoonModal
            triggerLabel="Build It With AI"
            triggerIcon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
            triggerVariant="outline"
            modalTitle="AI interview coming soon"
            modalDescription="A guided, conversational way to build your profile is planned for a later phase. Choose Fill It Out Myself for now — you can switch to AI once it's ready."
          />
        </Card>

        <Card className="flex flex-col items-center gap-3 py-8">
          <PencilLine className="h-8 w-8 text-neutral-700" aria-hidden="true" />
          <p className="font-display text-lg font-semibold text-neutral-900">
            Fill It Out Myself
          </p>
          <p className="text-sm text-neutral-500">
            Work through each section at your own pace.
          </p>
          <Button href="/profile/edit">Fill It Out Myself</Button>
        </Card>
      </div>
    </Container>
  );
}
