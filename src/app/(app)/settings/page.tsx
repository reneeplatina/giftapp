import { Container } from "@/components/container";
import { requireAuthUser } from "@/lib/auth/dal";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  await requireAuthUser("/settings");

  return (
    <Container className="flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-neutral-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Manage who can see your profile, and your account.
        </p>
      </div>
      <SettingsClient />
    </Container>
  );
}
