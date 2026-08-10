import { Container } from "@/components/container";
import { Card } from "@/components/ui/card";
import { requireAuthUser } from "@/lib/auth/dal";
import { FeedbackForm } from "@/components/feedback/feedback-form";

export default async function FeedbackPage() {
  await requireAuthUser("/feedback");

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Give feedback
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Tell us what&apos;s confusing, broken, or missing — it goes
          straight to the person building this.
        </p>
      </div>
      <Card>
        <FeedbackForm />
      </Card>
    </Container>
  );
}
