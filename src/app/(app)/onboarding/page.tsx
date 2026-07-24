import { PencilLine, Sparkles } from "lucide-react";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
            AI Gift Builder
          </p>
          <p className="text-sm text-neutral-500">
            One chat that learns your taste and suggests gifts as it goes.
          </p>
          <Button href="/interview" variant="outline">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            AI Gift Builder
          </Button>
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
