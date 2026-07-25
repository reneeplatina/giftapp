"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

type ServiceClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;

/**
 * Removes every file under {userId}/ in a storage bucket, including one
 * level of subfolders (wishlist-images nests files under {itemId}/).
 * Best-effort cleanup — the database rows and the auth user itself are
 * what actually matter for privacy, since RLS already makes these paths
 * unreachable the moment the profile row is gone.
 */
async function removeAllUnderPrefix(
  serviceClient: ServiceClient,
  bucket: "avatars" | "wishlist-images",
  userId: string,
) {
  const { data: entries } = await serviceClient.storage.from(bucket).list(userId);
  if (!entries || entries.length === 0) return;

  const filePaths: string[] = [];
  for (const entry of entries) {
    // Files have an id; Supabase Storage's folder-like prefix entries don't.
    if (entry.id) {
      filePaths.push(`${userId}/${entry.name}`);
      continue;
    }
    const { data: nested } = await serviceClient.storage
      .from(bucket)
      .list(`${userId}/${entry.name}`);
    for (const nestedEntry of nested ?? []) {
      filePaths.push(`${userId}/${entry.name}/${nestedEntry.name}`);
    }
  }

  if (filePaths.length > 0) {
    await serviceClient.storage.from(bucket).remove(filePaths);
  }
}

export async function deleteAccountAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You need to be signed in to delete your account." };
  }

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return {
      success: false,
      error: "Account deletion isn't available right now. Please try again later.",
    };
  }

  await Promise.allSettled([
    removeAllUnderPrefix(serviceClient, "avatars", user.id),
    removeAllUnderPrefix(serviceClient, "wishlist-images", user.id),
  ]);

  // Deletes the auth.users row, which cascades through every table that
  // references it — profiles, and from there profile_sections,
  // wishlist_items, ai_interview_sessions/messages, gift_exchange_requests,
  // and profile_reports — per the "on delete cascade" constraints in
  // supabase/migrations. There is nothing left to clean up manually.
  const { error } = await serviceClient.auth.admin.deleteUser(user.id);
  if (error) {
    return { success: false, error: "Couldn't delete your account. Please try again." };
  }

  await supabase.auth.signOut().catch(() => {});
  redirect("/");
}
