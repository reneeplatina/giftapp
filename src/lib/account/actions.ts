"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { removeAllUnderPrefix } from "@/lib/storage/remove-profile-files";

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

  // Profiles this account manages (see managed_by_profile_id) each have
  // their own synthetic auth.users row that nothing else will ever clean
  // up — deleting the manager's profile row cascades away the *profile*
  // (managed_by_profile_id references profiles.id on delete cascade),
  // but leaves that orphaned auth user behind unless we delete it here,
  // the same way we delete the manager's own.
  const { data: managedProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("managed_by_profile_id", user.id);

  const profileIds = [user.id, ...(managedProfiles ?? []).map((row) => row.id)];

  await Promise.allSettled(
    profileIds.flatMap((profileId) => [
      removeAllUnderPrefix(serviceClient, "avatars", profileId),
      removeAllUnderPrefix(serviceClient, "wishlist-images", profileId),
      removeAllUnderPrefix(serviceClient, "profile-images", profileId),
    ]),
  );

  for (const profileId of profileIds) {
    if (profileId === user.id) continue;
    await serviceClient.auth.admin.deleteUser(profileId).catch(() => {});
  }

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
