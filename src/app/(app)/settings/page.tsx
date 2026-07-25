import { Container } from "@/components/container";
import { requireAuthUser } from "@/lib/auth/dal";
import { getActiveProfileId } from "@/lib/profile/active";
import { getManagedProfiles } from "@/lib/profile/managed-dal";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const user = await requireAuthUser("/settings");
  const [activeProfileId, managedProfiles] = await Promise.all([
    getActiveProfileId(),
    getManagedProfiles(),
  ]);
  const isManagedProfileActive = activeProfileId !== user.id;

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
      <SettingsClient
        isManagedProfileActive={isManagedProfileActive}
        activeProfileId={activeProfileId ?? user.id}
        managedProfiles={managedProfiles}
      />
    </Container>
  );
}
