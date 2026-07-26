import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_HIDDEN_SECTIONS,
  SECTION_KEY_MAP,
  defaultSectionValue,
  type SectionTsKey,
} from "@/lib/profile/section-keys";
import type { Database } from "@/types/database";

/**
 * Upserts one profile_sections row, preserving whichever of data/isPublic
 * isn't part of this patch. Shared by the manual profile-builder actions
 * and the AI interview's extraction-apply step so both write sections the
 * same way.
 */
export async function upsertSectionRow(
  supabase: SupabaseClient<Database>,
  profileId: string,
  tsKey: SectionTsKey,
  patch: { data?: unknown; isPublic?: boolean },
): Promise<string | null> {
  const dbKey = SECTION_KEY_MAP[tsKey];
  const { data: existing } = await supabase
    .from("profile_sections")
    .select("data, is_public")
    .eq("profile_id", profileId)
    .eq("section_key", dbKey)
    .maybeSingle();

  const data =
    patch.data !== undefined ? patch.data : existing?.data ?? defaultSectionValue(tsKey);
  const isPublic =
    patch.isPublic !== undefined
      ? patch.isPublic
      : existing?.is_public ?? !DEFAULT_HIDDEN_SECTIONS.includes(tsKey);

  const { error } = await supabase
    .from("profile_sections")
    .upsert(
      {
        profile_id: profileId,
        section_key: dbKey,
        data: data as Database["public"]["Tables"]["profile_sections"]["Insert"]["data"],
        is_public: isPublic,
      },
      { onConflict: "profile_id,section_key" },
    );

  return error?.message ?? null;
}
