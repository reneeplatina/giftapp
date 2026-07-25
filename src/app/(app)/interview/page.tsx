import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth/dal";
import { getActiveProfileId } from "@/lib/profile/active";
import { getLatestInterviewSession } from "@/lib/interview/dal";
import { loadInterviewStateView } from "@/lib/interview/view";
import { Container } from "@/components/container";
import { InterviewClient } from "./interview-client";

export default async function InterviewPage() {
  const user = await requireAuthUser("/interview");
  const activeProfileId = await getActiveProfileId();
  if (!activeProfileId) redirect("/dashboard");
  const isManagedProfileActive = activeProfileId !== user.id;

  const session = await getLatestInterviewSession(activeProfileId);
  const initialState = session
    ? await loadInterviewStateView(session.id, activeProfileId)
    : null;

  return (
    <Container className="flex flex-1 flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          AI Gift Builder
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {isManagedProfileActive
            ? "One chat that learns their taste and suggests gifts as it goes. Nothing is added to this profile or wishlist until you approve it."
            : "One chat that learns your taste and suggests gifts as it goes. Nothing is added to your profile or wishlist until you approve it."}
        </p>
      </div>
      <InterviewClient initialState={initialState} />
    </Container>
  );
}
