"use client";

import { useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ShareModal } from "@/components/share-modal";
import { useProfile } from "@/context/profile-context";
import type { ProfileStatus } from "@/types/profile";

const STATUS_LABEL: Record<ProfileStatus, string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
};

const STATUS_VARIANT: Record<ProfileStatus, "success" | "warning" | "outline"> =
  {
    draft: "warning",
    published: "success",
    hidden: "outline",
  };

/**
 * The status badge plus the sharing controls, kept together on purpose.
 *
 * A draft or hidden profile answers its public link with "no profile
 * here", so offering Copy link / Share on one hands out a link that is
 * already broken — the profile owner has no way to tell until someone
 * else reports it. Until the profile is published, this offers the one
 * action that actually helps: publishing it.
 */
export function ShareRow({
  url,
  displayName,
  isManagedProfile = false,
}: {
  /** Defaults to the active profile's own link. */
  url?: string;
  /** Defaults to the active profile's display name. */
  displayName?: string;
  isManagedProfile?: boolean;
}) {
  const { profile, publicUrl, setStatus } = useProfile();
  const status = profile.privacy.status;
  const shareUrl = url ?? publicUrl;
  const name = displayName ?? profile.basicInfo.displayName;
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    const result = await setStatus("published");
    setPublishing(false);
    if (!result.success) {
      setError(result.error ?? "Couldn't publish. Try again.");
    }
  }

  const who = isManagedProfile ? `${name}'s profile` : "Your profile";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
        <div className="flex flex-wrap gap-2">
          {status === "published" ? (
            <>
              <CopyLinkButton url={shareUrl} />
              <ShareModal
                url={shareUrl}
                title={`GIFT ME! 🎁 — ${name}'s gift profile`}
              />
            </>
          ) : (
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Globe className="h-4 w-4" aria-hidden="true" />
              )}
              {publishing ? "Publishing…" : "Publish to share"}
            </Button>
          )}
        </div>
      </div>

      {status !== "published" && (
        <p className="text-sm text-neutral-600">
          {status === "draft"
            ? `${who} isn't live yet, so the link won't open for anyone you send it to. Publish it to get a link you can share.`
            : `${who} is hidden, so the link is switched off. Publish it to turn the link back on.`}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
