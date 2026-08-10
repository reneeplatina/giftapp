import { redirect } from "next/navigation";
import { Container } from "@/components/container";
import { Card } from "@/components/ui/card";
import { requireAuthUser } from "@/lib/auth/dal";
import { isAdminEmail } from "@/lib/admin";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const DAY_MS = 24 * 60 * 60 * 1000;

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-sm text-neutral-600">{label}</p>
      <p className="font-display text-3xl font-semibold text-neutral-900">
        {value}
      </p>
    </Card>
  );
}

function computeSignupStats(accounts: { status: string; created_at: string }[]) {
  const now = Date.now();
  return {
    totalSignups: accounts.length,
    publishedCount: accounts.filter((a) => a.status === "published").length,
    signupsLast7Days: accounts.filter(
      (a) => now - new Date(a.created_at).getTime() < 7 * DAY_MS,
    ).length,
    signupsLast30Days: accounts.filter(
      (a) => now - new Date(a.created_at).getTime() < 30 * DAY_MS,
    ).length,
  };
}

export default async function AdminPage() {
  const user = await requireAuthUser("/admin");
  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return (
      <Container className="py-8">
        <p className="text-neutral-600">Service role isn&apos;t configured.</p>
      </Container>
    );
  }

  const [{ data: accounts }, { data: feedbackRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, status, created_at")
      .is("managed_by_profile_id", null),
    supabase
      .from("feedback")
      .select("id, profile_id, message, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const allAccounts = accounts ?? [];
  const { totalSignups, publishedCount, signupsLast7Days, signupsLast30Days } =
    computeSignupStats(allAccounts);

  const feedback = feedbackRows ?? [];
  const senderIds = [...new Set(feedback.map((f) => f.profile_id))];
  const { data: senders } =
    senderIds.length > 0
      ? await supabase.from("profiles").select("id, display_name").in("id", senderIds)
      : { data: [] };
  const senderNameById = new Map((senders ?? []).map((s) => [s.id, s.display_name]));

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Admin
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Only visible to you. Real accounts — managed/kid profiles aren&apos;t
          counted separately here.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total signups" value={totalSignups} />
        <StatCard label="Published profiles" value={publishedCount} />
        <StatCard label="New in last 7 days" value={signupsLast7Days} />
        <StatCard label="New in last 30 days" value={signupsLast30Days} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Feedback
        </h2>
        {feedback.length === 0 ? (
          <p className="text-sm text-neutral-600">Nothing yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {feedback.map((item) => (
              <Card key={item.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900">
                    {senderNameById.get(item.profile_id) ?? "Someone"}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-sm text-neutral-700">
                  {item.message}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
