import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EMPTY_SIZES,
  SECTION_KEY_MAP,
  SECTION_TS_KEYS,
  type SectionTsKey,
} from "@/lib/profile/section-keys";
import { upsertSectionRow } from "@/lib/profile/section-writes";
import type { InterviewExtraction } from "@/lib/validation/ai-interview";
import type { Database } from "@/types/database";
import type { Sizes } from "@/types/profile";

const CHIP_LIST_KEYS = SECTION_TS_KEYS.filter(
  (key): key is Exclude<SectionTsKey, "sizes"> => key !== "sizes",
);

/** Case-insensitive de-duped append, capped to match chipListSchema's limit in profile/actions.ts. */
export function mergeChipList(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map((item) => item.toLowerCase()));
  const merged = [...existing];
  for (const raw of incoming) {
    const item = raw.trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged.slice(0, 60);
}

/**
 * Writes an approved interview extraction into the profile — the only
 * path from AI output to the database, and only ever called after the
 * user has explicitly approved the specific fields being applied.
 */
export async function applyInterviewExtraction(
  supabase: SupabaseClient<Database>,
  profileId: string,
  fields: InterviewExtraction,
): Promise<string | null> {
  for (const key of CHIP_LIST_KEYS) {
    const incoming = fields[key];
    if (!incoming || incoming.length === 0) continue;

    const { data: existing } = await supabase
      .from("profile_sections")
      .select("data")
      .eq("profile_id", profileId)
      .eq("section_key", SECTION_KEY_MAP[key])
      .maybeSingle();

    const existingList = Array.isArray(existing?.data) ? (existing.data as string[]) : [];
    const merged = mergeChipList(existingList, incoming);
    const error = await upsertSectionRow(supabase, profileId, key, { data: merged });
    if (error) return error;
  }

  if (fields.sizes) {
    const { data: existing } = await supabase
      .from("profile_sections")
      .select("data")
      .eq("profile_id", profileId)
      .eq("section_key", "sizes")
      .maybeSingle();

    const existingSizes = (existing?.data as Sizes | undefined) ?? EMPTY_SIZES;
    const merged: Sizes = {
      ...existingSizes,
      ...Object.fromEntries(
        Object.entries(fields.sizes).filter(([, value]) => Boolean(value)),
      ),
    };
    const error = await upsertSectionRow(supabase, profileId, "sizes", { data: merged });
    if (error) return error;
  }

  if (fields.introduction) {
    const { error } = await supabase
      .from("profiles")
      .update({ introduction: fields.introduction })
      .eq("id", profileId);
    if (error) return error.message;
  }

  return null;
}
