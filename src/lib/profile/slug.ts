import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { RESERVED_SLUGS as RESERVED_SLUGS_LIST } from "@/lib/profile/reserved-slugs";

const RESERVED_SLUGS = new Set<string>(RESERVED_SLUGS_LIST);

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents left over from NFKD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base.length >= 3 ? base : `${base || "gift"}-profile`;
}

/**
 * Generates a slug from a display name and appends -2, -3, ... until it
 * finds one that's both not reserved and not already taken. Always
 * succeeds — the caller never needs to handle a "slug taken" error,
 * since the person creating an account never picks their own initial
 * slug (they can rename it later from Profile Builder).
 */
export async function generateUniqueSlug(
  supabase: SupabaseClient<Database>,
  displayName: string,
): Promise<string> {
  const base = slugify(displayName);
  let candidate = RESERVED_SLUGS.has(base) ? `${base}-profile` : base;
  let suffix = 2;

  // Bounded loop — this table will never have anywhere near enough rows
  // sharing a base slug to exhaust a reasonable attempt count.
  for (let attempts = 0; attempts < 50; attempts += 1) {
    if (!RESERVED_SLUGS.has(candidate)) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", candidate)
        .maybeSingle();

      if (!data) return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  // Extremely unlikely fallback: a random suffix instead of a sequential one.
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
