import "server-only";

import type { createServiceRoleClient } from "@/lib/supabase/service-role";

type ServiceClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;

/**
 * Removes every file under {profileId}/ in a storage bucket, including
 * one level of subfolders (wishlist-images nests files under {itemId}/).
 * Best-effort cleanup — the database rows and the auth user itself are
 * what actually matter for privacy, since RLS already makes these paths
 * unreachable the moment the profile row is gone.
 */
export async function removeAllUnderPrefix(
  serviceClient: ServiceClient,
  bucket: "avatars" | "wishlist-images",
  profileId: string,
) {
  const { data: entries } = await serviceClient.storage.from(bucket).list(profileId);
  if (!entries || entries.length === 0) return;

  const filePaths: string[] = [];
  for (const entry of entries) {
    // Files have an id; Supabase Storage's folder-like prefix entries don't.
    if (entry.id) {
      filePaths.push(`${profileId}/${entry.name}`);
      continue;
    }
    const { data: nested } = await serviceClient.storage
      .from(bucket)
      .list(`${profileId}/${entry.name}`);
    for (const nestedEntry of nested ?? []) {
      filePaths.push(`${profileId}/${entry.name}/${nestedEntry.name}`);
    }
  }

  if (filePaths.length > 0) {
    await serviceClient.storage.from(bucket).remove(filePaths);
  }
}
