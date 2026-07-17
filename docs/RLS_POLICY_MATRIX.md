# Row Level Security Policy Matrix

Every table in `public` has RLS enabled. This matrix records, for each
table, exactly who can do what — and was verified against a real
(disposable, local-only) Postgres instance with the actual migration
files; see "How this was tested" at the bottom.

Legend: **Owner** = the authenticated user whose `auth.uid()` matches the
row's `profile_id` (or `id`, for `profiles` itself). **Other auth** = any
other signed-in user. **Anon** = unauthenticated visitor.

## `profiles`

| Role | select | insert | update | delete |
|---|---|---|---|---|
| Owner | ✅ (`id = auth.uid()`) | ✅ (`id = auth.uid()`) | ✅ | ✅ |
| Other auth | ❌ | ❌ | ❌ | ❌ |
| Anon | ❌ (no grant at all) | ❌ | ❌ | ❌ |

Public reads (any status other than published are indistinguishable
from "doesn't exist") only ever go through `get_public_profile()`.

## `profile_sections`, `wishlist_items`, `ai_interview_sessions`, `ai_interview_messages`, `ai_suggestions`

All four follow the same single-policy pattern:

| Role | select | insert | update | delete |
|---|---|---|---|---|
| Owner (`profile_id = auth.uid()`) | ✅ | ✅ | ✅ | ✅ |
| Other auth | ❌ | ❌ | ❌ | ❌ |
| Anon | ❌ | ❌ | ❌ | ❌ |

Public reads of `profile_sections`/`wishlist_items` (public + non-archived
rows of a published profile only) go through `get_public_profile()`, not
direct table access.

## `gift_exchange_requests`

| Role | select | insert | update | delete |
|---|---|---|---|---|
| Source owner (`source_profile_id = auth.uid()`) | ✅ | ✅ | ✅ | ✅ |
| Referred user (`referred_user_id = auth.uid()`) | ✅ | ❌ | ❌ | ❌ |
| Other auth | ❌ | ❌ | ❌ | ❌ |
| Anon | ❌ | ❌ | ❌ | ❌ |

Claiming/completing a request is **not** a table-level policy — see
`docs/GIFT_EXCHANGE_FLOW.md` for why, and use
`claim_exchange_request()` / `complete_exchange_request()` instead. Anon
can only reach this table's data through `resolve_exchange_token()`.

## `ai_usage_events`

| Role | select | insert | update | delete |
|---|---|---|---|---|
| Anyone (anon or auth) | ❌ | ❌ | ❌ | ❌ |

No policies at all. Only the service-role key (server-side only, per
`CLAUDE.md`) can touch this table — it bypasses RLS by design.

## `profile_reports`

| Role | select | insert | update | delete |
|---|---|---|---|---|
| Authenticated | ❌ | ✅ (`reporter_user_id = auth.uid()` or null) | ❌ | ❌ |
| Anon | ❌ | ✅ (`reporter_user_id` must be null) | ❌ | ❌ |

Insert-only for everyone — no one (not even the reported profile's
owner) can read reports back through the API; review happens through
trusted server-side/service-role tooling only, out of scope for this
phase.

## Storage: `avatars`, `wishlist-images`

Both buckets are private (`public = false`). Path convention
`{profile_id}/...`.

| Role | select (read) | insert | update | delete |
|---|---|---|---|---|
| Owner (`foldername[1] = auth.uid()`) | ✅ | ✅ | ✅ | ✅ |
| Anyone, if profile is published (`is_profile_published(...)`) | ✅ | ❌ | ❌ | ❌ |
| Anyone, if profile is draft/hidden | ❌ | ❌ | ❌ | ❌ |

## Functions (the only anon-reachable surface)

| Function | Callable by | Returns |
|---|---|---|
| `get_public_profile(slug)` | anon, authenticated | curated public profile jsonb, or null |
| `resolve_exchange_token(token)` | anon, authenticated | `{valid, status, sourceDisplayName, sourceSlug}` |
| `claim_exchange_request(token)` | authenticated only | `{claimed, reason?}` |
| `complete_exchange_request(token, slug)` | authenticated only | `{completed, reason?}` |
| `is_profile_published(id)` | anon, authenticated | boolean (internal helper for storage policies) |

## How this was tested

Since no live Supabase project was connected (per this phase's
constraints), policies were verified against a real, throwaway local
Postgres 16 instance: a minimal stand-in for `auth.users`/`auth.uid()`/
the `anon`/`authenticated` roles/a bare `storage.objects` table was
loaded, then every migration file was applied unmodified, then a battery
of `SET ROLE` / `SET LOCAL request.jwt.claim.sub` tests ran the actual
policies under each role. All scenarios below passed:

- Owner reads/updates their own profile, sections, and wishlist.
- A second authenticated user sees 0 rows of another user's private data
  and cannot update it (0 rows affected).
- Anonymous `select` on `profiles` fails with a permission error (no
  grant at all — not just an empty result).
- `get_public_profile()` on a published profile returns the curated
  object, **omitting** a section explicitly marked private and a
  wishlist item explicitly marked private.
- `get_public_profile()` on a draft profile, and on a nonexistent slug,
  both return `null`.
- `resolve_exchange_token()` on a valid token returns `valid: true`;
  on a made-up token returns `valid: false`.
- A referred user calls `claim_exchange_request()` and succeeds; a third,
  unrelated user then gets `{claimed: false, reason: "already_claimed"}`
  and sees 0 rows of that request via direct table access.
- The source owner cancels the request; `resolve_exchange_token()`
  immediately reflects `valid: false`.
- Storage: the owner can insert into their own folder; a different user
  attempting to insert into that folder is blocked by RLS; an anonymous
  reader can see an avatar object under a published profile but sees 0
  objects under a draft profile's folder.

The throwaway database was dropped immediately after; nothing here ever
touched a real or remote database.
