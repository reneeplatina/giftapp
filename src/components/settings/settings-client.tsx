"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PrivacySection } from "@/components/profile-builder/privacy-section";
import { LinkedProfilesSection } from "@/components/settings/linked-profiles-section";
import { deleteAccountAction } from "@/lib/account/actions";
import { deleteManagedProfileAction } from "@/lib/profile/managed-actions";
import type { ManagedProfileSummary } from "@/lib/profile/managed-dal";

export function SettingsClient({
  isManagedProfileActive,
  activeProfileId,
  managedProfiles,
}: {
  isManagedProfileActive: boolean;
  activeProfileId: string;
  managedProfiles: ManagedProfileSummary[];
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    if (isManagedProfileActive) {
      const result = await deleteManagedProfileAction(activeProfileId);
      setDeleting(false);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error ?? "Couldn't remove that profile. Please try again.");
      }
      return;
    }

    const result = await deleteAccountAction();
    // On success, deleteAccountAction redirects away and this line never runs.
    setDeleting(false);
    if (!result.success) {
      setError(result.error ?? "Couldn't delete your account. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Privacy
        </h2>
        <Card>
          <PrivacySection />
        </Card>
      </section>

      {!isManagedProfileActive && (
        <LinkedProfilesSection initialProfiles={managedProfiles} />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-red-700">
          Danger zone
        </h2>
        <Card className="flex flex-col gap-3 border-red-200 bg-red-50">
          <p className="text-sm text-neutral-700">
            {isManagedProfileActive
              ? "Permanently remove this profile, its wishlist, and its photos. This can't be undone."
              : "Permanently delete your profile, wishlist, photos, and account. This can't be undone."}
          </p>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-fit border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            {isManagedProfileActive ? "Remove this profile" : "Delete my profile"}
          </Button>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={
          isManagedProfileActive
            ? "Remove this profile permanently?"
            : "Delete your profile permanently?"
        }
        description={
          isManagedProfileActive
            ? "This removes this profile, its wishlist, and its photos for good — anyone with the link will see it's gone. This can't be undone."
            : "This removes your profile, wishlist, photos, and account for good — anyone with your link will see it's gone. This can't be undone."
        }
        confirmLabel={isManagedProfileActive ? "Remove profile" : "Delete my profile"}
      />
    </div>
  );
}
