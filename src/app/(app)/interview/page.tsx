import { requireAuthUser } from "@/lib/auth/dal";
import { getLatestInterviewSession } from "@/lib/interview/dal";
import { loadInterviewStateView } from "@/lib/interview/view";
import { Container } from "@/components/container";
import { InterviewClient } from "./interview-client";

export default async function InterviewPage() {
  const user = await requireAuthUser("/interview");

  const session = await getLatestInterviewSession(user.id);
  const initialState = session
    ? await loadInterviewStateView(session.id, user.id)
    : null;

  return (
    <Container className="flex flex-1 flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          AI-guided interview
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Answer a few casual questions and I&apos;ll fill in your gift
          profile as we go — nothing is saved until you approve it.
        </p>
      </div>
      <InterviewClient initialState={initialState} />
    </Container>
  );
}
