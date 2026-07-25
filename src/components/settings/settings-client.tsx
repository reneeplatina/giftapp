"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PrivacySection } from "@/components/profile-builder/privacy-section";
import { deleteAccountAction } from "@/lib/account/actions";

export function SettingsClient() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
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

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-red-700">
          Danger zone
        </h2>
        <Card className="flex flex-col gap-3 border-red-200 bg-red-50">
          <p className="text-sm text-neutral-700">
            Permanently delete your profile, wishlist, photos, and account.
            This can&apos;t be undone.
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
            Delete my profile
          </Button>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete your profile permanently?"
        description="This removes your profile, wishlist, photos, and account for good — anyone with your link will see it's gone. This can't be undone."
        confirmLabel="Delete my profile"
      />
    </div>
  );
}
