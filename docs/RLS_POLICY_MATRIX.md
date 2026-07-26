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
| Manager (`managed_by_profile_id = auth.uid()`) | ✅ | ❌ (service role only — see below) | ✅ | ✅ |
| Other auth | ❌ | ❌ | ❌ | ❌ |
| Anon | ❌ (no grant at all) | ❌ | ❌ | ❌ |

Public reads (any status other than published are indistinguishable
from "doesn't exist") only ever go through `get_public_profile()`.

**Managed profiles** (`supabase/migrations/20260725000001_managed_profiles.sql`):
a profile can be created and controlled by another profile's owner —
for someone who wants a gift profile but won't sign up themselves (a
child, a grandparent). The managed profile still has a real
`auth.users` row (so the existing `profiles.id -> auth.users.id` FK is
unchanged) — it's just a synthetic one nobody signs into. What grants
access is `managed_by_profile_id`, checked by additive policies keyed
off `auth.uid()` rather than `id`. A trigger
(`prevent_managed_profile_chaining`) blocks a managed profile from
itself managing another — one level of nesting only. Creating a managed
profile's row always goes through the service role (it also has to
create the synthetic auth user first, which requires the admin API), so
there is no client-facing `insert` policy for the manager.

## `profile_sections`, `wishlist_items`, `profile_images`, `ai_interview_sessions`, `ai_interview_messages`, `ai_suggestions`

The first five follow the same two-policy pattern (`ai_suggestions` has
no managed-profile policy yet — it's unused by any shipped feature):

| Role | select | insert | update | delete |
|---|---|---|---|---|
| Owner (`profile_id = auth.uid()`) | ✅ | ✅ | ✅ | ✅ |
| Manager (`profile_id` is managed by `auth.uid()`) | ✅ | ✅ | ✅ | ✅ |
| Other auth | ❌ | ❌ | ❌ | ❌ |
| Anon | ❌ | ❌ | ❌ | ❌ |

Public reads of `profile_sections`/`wishlist_items` (public + non-archived
rows of a published profile only) go through `get_public_profile()`, not
direct table access. `get_public_profile()` also returns a
`managedProfiles` array of the profile's own published managed
profiles, for a manager's public page to link out to them.

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

## Storage: `avatars`, `wishlist-images`, `profile-images`

All three buckets are private (`public = false`). Path convention
`{profile_id}/...`.

| Role | select (read) | insert | update | delete |
|---|---|---|---|---|
| Owner (`foldername[1] = auth.uid()`) | ✅ | ✅ | ✅ | ✅ |
| Manager (`foldername[1]` is a profile managed by `auth.uid()`) | ✅ (via owner-or-published read policy) | ✅ | ✅ | ✅ |
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

**First**, against a throwaway local Postgres 16 instance (a minimal
stand-in for `auth.users`/`auth.uid()`/the `anon`/`authenticated` roles/a
bare `storage.objects` table), before any real Supabase project existed.
**Later**, the same category of tests were re-run directly against the
real "Gift Profile App" Supabase project once it was created, using
temporary fixture rows that were deleted immediately afterward. Both
rounds passed:

- Owner reads/updates their own profile, sections, and wishlist.
- A second authenticated user sees 0 rows of another user's private data
  and cannot update it (0 rows affected).
- Anonymous `select`/`insert` on `profiles` returns/affects 0 rows.
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

### Differences found between the local test and the real project

- **`alter table storage.objects enable row level security` fails on
  real Supabase** (`must be owner of table objects`) — `storage.objects`
  is owned by Supabase's own internal storage role and already has RLS
  enabled by the platform. The migration now skips this line entirely
  (see `supabase/migrations/20260717000011_storage_buckets.sql`).
- **Anon and authenticated get default privileges on everything in the
  `public` schema automatically** — both `EXECUTE` on newly created
  functions and `SELECT`/`INSERT`/`UPDATE`/`DELETE` on newly created
  tables, granted directly (not through the `PUBLIC` pseudo-role), the
  moment each object is created. A vanilla local Postgres instance has
  no such default. Practically: **RLS itself — not the presence or
  absence of a `GRANT`** — is the real enforcement boundary on Supabase.
  A `revoke ... from public` does not remove a direct grant already made
  to `anon`; each role that shouldn't have a privilege must be revoked
  explicitly. This surfaced one real gap: `claim_exchange_request()` and
  `complete_exchange_request()` were callable by `anon` at the grant
  level (though both already rejected anon internally via a null
  `auth.uid()` check, so this was not exploitable) — fixed by adding an
  explicit `revoke execute ... from anon` for both.
- **Supabase's own security advisor caught two functions missing a
  pinned `search_path`** (`set_updated_at`, a trigger function; and
  `check_message_profile_matches_session`, the AI-message consistency
  trigger) — a hardening best practice my local testing didn't check
  for. Both now set `search_path = public` explicitly.

After these fixes, `get_advisors(type: "security")` against the real
project reports only expected/intentional findings: `ai_usage_events`
has RLS enabled with no policies (by design — service-role only), and
the five functions meant to be publicly callable are flagged as
"publicly callable" (also by design).

**Managed profiles**, added later, were verified directly against the
real project (temporary fixture rows, deleted immediately after): a
normal manager-assignment succeeds; a second-level assignment (a
managed profile attempting to manage another) is rejected by
`prevent_managed_profile_chaining`; a self-reference is rejected by the
`profiles_not_self_managed` check constraint. `get_advisors` reported
no new findings beyond the pre-existing ones above.
