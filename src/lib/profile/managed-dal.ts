import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/dal";
import { getActiveProfileId } from "@/lib/profile/active";
import { getAvatarSignedUrl } from "@/lib/profile/dal";
import type { Database } from "@/types/database";
import type { ProfileStatus } from "@/types/profile";

export interface ManagedProfileSummary {
  id: string;
  displayName: string;
  slug: string;
  avatarUrl: string | null;
  status: ProfileStatus;
}

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "display_name" | "slug" | "avatar_path" | "status"
>;

async function toSummary(
  supabase: SupabaseClient<Database>,
  row: ProfileRow,
): Promise<ManagedProfileSummary> {
  return {
    id: row.id,
    displayName: row.display_name,
    slug: row.slug,
    avatarUrl: await getAvatarSignedUrl(supabase, row.avatar_path),
    status: row.status,
  };
}

/**
 * Lists the profiles the signed-in user manages (see
 * profiles.managed_by_profile_id) — the RLS policy added alongside that
 * column already scopes this to exactly the caller's own managed set, so
 * there's nothing further to filter here.
 */
export async function getManagedProfiles(): Promise<ManagedProfileSummary[]> {
  const user = await getAuthUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, slug, avatar_path, status")
    .eq("managed_by_profile_id", user.id)
    .order("created_at", { ascending: true });

  if (!data) return [];
  return Promise.all(data.map((row) => toSummary(supabase, row)));
}

export interface ProfileSwitcherData {
  activeProfileId: string | null;
  own: ManagedProfileSummary | null;
  managed: ManagedProfileSummary[];
}

/**
 * Everything the profile switcher (sidebar/topbar) needs in one round
 * trip: the signed-in user's own profile, every profile they manage, and
 * which of those is currently active.
 */
export async function getProfileSwitcherData(): Promise<ProfileSwitcherData> {
  const user = await getAuthUser();
  if (!user) return { activeProfileId: null, own: null, managed: [] };

  const supabase = await createClient();
  const [{ data: ownRow }, { data: managedRows }, activeProfileId] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, slug, avatar_path, status")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, display_name, slug, avatar_path, status")
      .eq("managed_by_profile_id", user.id)
      .order("created_at", { ascending: true }),
    getActiveProfileId(),
  ]);

  const own = ownRow ? await toSummary(supabase, ownRow) : null;
  const managed = await Promise.all((managedRows ?? []).map((row) => toSummary(supabase, row)));

  return { activeProfileId, own, managed };
}
