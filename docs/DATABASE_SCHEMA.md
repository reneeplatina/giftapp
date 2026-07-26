# Database Schema

This documents the schema created by `supabase/migrations/*.sql`. It
supersedes the earlier draft in `docs/DATABASE_PLAN.md` (kept for
history). Every table lives in the `public` schema. Nothing here has
been applied to any real/remote database — these are local migration
files only, validated against a disposable local Postgres instance.

## Conventions

- Every table has Row Level Security enabled, no exceptions.
- `profiles.id` is both its primary key **and** a foreign key to
  `auth.users.id` (one profile per account). Because of that, every
  child table's ownership check is simply `profile_id = auth.uid()` —
  no joins required anywhere in this schema.
- `created_at`/`updated_at` are `timestamptz default now()`, with
  `updated_at` kept current by a shared `set_updated_at()` trigger.
- All primary keys are `uuid default gen_random_uuid()` (via the
  `pgcrypto` extension), except `profiles.id`, which is supplied by
  `auth.users.id`.
- Migrations are strictly additive (new tables/columns only); nothing
  drops or destructively alters existing structure.

## Tables

### `profiles`

One row per user account.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK, FK → `auth.users.id` | cascades on account deletion |
| `slug` | text, unique | lowercase, URL-safe, reserved-word protected (see below) |
| `display_name` | text | required, non-blank |
| `avatar_path` | text, nullable | storage path in the `avatars` bucket |
| `introduction` | text | shown at the top of the public profile |
| `gift_style_summary` | text | short "my gift style" line |
| `birthday` | date, nullable | |
| `default_theme` | text | one of the 11 theme keys used by the Phase 1 UI |
| `status` | enum `profile_status` | `draft` \| `published` \| `hidden` |
| `created_at` / `updated_at` | timestamptz | |

**Slug rules** (all enforced by CHECK constraints, not application code):
lowercase, `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–40 characters, and not one of a
reserved list covering the app's own routes (`admin`, `api`, `dashboard`,
`login`, `signup`, `u`, `preview`, ...) so a profile link can never
collide with or impersonate part of the app itself.

### `profile_sections`

One row per profile per content section.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `profile_id` | uuid, FK → `profiles.id` | |
| `section_key` | text | restricted by CHECK to the 12 keys below |
| `data` | jsonb | array or object, shape depends on `section_key` |
| `is_public` | boolean | per-section visibility on the public profile |
| `sort_order` | integer | |
| `created_at` / `updated_at` | timestamptz | |

`section_key` must be one of: `favorite_colors`, `interests`, `sizes`,
`food_and_drinks`, `favorite_stores`, `tech_and_gaming`,
`home_and_lifestyle`, `creativity`, `fitness_and_wellness`,
`experiences`, `digital_gifts`, `things_to_avoid` — matching the section
keys already used by the Phase 1 mock-data UI (`src/types/profile.ts`),
so a future phase can map the two 1:1. `UNIQUE (profile_id, section_key)`
— a profile has at most one row per section.

### `wishlist_items`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `profile_id` | uuid, FK → `profiles.id` | |
| `name` | text | required, non-blank |
| `description` | text | |
| `image_path` | text, nullable | storage path in `wishlist-images` |
| `product_url` | text, nullable | user-supplied only; must be `https://` |
| `estimated_price` | numeric(10,2), nullable | the owner's own estimate, never a live/AI price |
| `budget_level` | enum `wishlist_budget_level`, nullable | `under_25` \| `25_to_75` \| `75_to_200` \| `over_200` |
| `category` | text, nullable | |
| `priority` | enum `wishlist_priority` | `nice_to_have` \| `would_love` \| `dream_gift` |
| `preferred_color` / `preferred_size` | text, nullable | |
| `acceptable_alternatives` | text, nullable | |
| `accepts_used` / `accepts_refurbished` / `accepts_contributions` | boolean | |
| `item_type` | enum `wishlist_item_type` | `exact_item` \| `general_idea` \| `dream_gift` |
| `is_public` / `is_archived` | boolean | |
| `sort_order` | integer | |
| `created_at` / `updated_at` | timestamptz | |

`product_url` is constrained to `https://` — it can only ever be a link
the profile owner typed in themselves (docs/AI_SAFETY.md: "the AI does
not invent new [links]"); this table has no AI-authorship column at all.

### `ai_interview_sessions` / `ai_interview_messages`

State for a future guided, conversational profile-building feature (not
built yet — this phase only creates the storage for it).

`ai_interview_sessions`: `status` (enum `ai_interview_status`:
`in_progress` \| `completed` \| `abandoned`), `current_topic`,
`completion_percentage` (0–100), `completed_at`.

`ai_interview_messages`: `session_id` (FK), `profile_id` (FK, denormalized
alongside `session_id` purely so RLS can check ownership directly without
a join — a trigger enforces it always matches the parent session's
`profile_id`), `role` (enum `ai_message_role`: `user` \| `assistant`),
`content`, `structured_updates` (jsonb).

### `ai_suggestions`

AI-generated gift ideas surfaced to the owner. `suggestion_type` (text),
`content` (jsonb), `status` (enum `ai_suggestion_status`: `pending` \|
`accepted` \| `dismissed`).

### `gift_exchange_requests`

See `docs/GIFT_EXCHANGE_FLOW.md` for the full flow. Schema summary:
`source_profile_id` (FK), `recipient_label` (text, nullable — e.g. "Mom",
never a phone number or email), `exchange_token` (48-char random hex,
unique, CHECK-constrained to that exact format), `referred_user_id` /
`referred_profile_id` (nullable FKs, filled in as the flow progresses),
`status` (enum `exchange_status`: `created` \| `started` \| `completed`
\| `cancelled`), `share_count`, `last_shared_at`, `started_at`,
`completed_at`.

### `ai_usage_events`

Append-only log backing `AI_DAILY_USER_LIMIT` / `AI_DAILY_GUEST_LIMIT`
(docs/AI_SAFETY.md). `user_id` (nullable FK, cascades on account
deletion — this data only exists to back short-lived rate limiting, so
there's nothing to retain once the account is gone), `anonymous_session_hash`
(nullable text), `feature_name`. CHECK requires at least one of
`user_id`/`anonymous_session_hash` to be present. No `updated_at` — rows
are never modified after insert.

### `profile_reports`

Abuse/moderation reports. `reported_profile_id` (FK), `reporter_user_id`
(nullable FK — anonymous reports are allowed), `reason`, `details`
(nullable), `status` (enum `profile_report_status`: `open` \| `reviewed`
\| `resolved`).

## Functions

Defined in `20260717000008_public_access_functions.sql`, all
`SECURITY DEFINER` so they can assemble a safe response without granting
the caller any direct table access:

- **`get_public_profile(profile_slug text) → jsonb`** — the sole way
  anyone (including anonymous visitors) reads a public profile. Returns
  `null` for anything not `status = 'published'`, or a curated object
  with only public-facing fields, public sections, and public/
  non-archived wishlist items. Never includes `profiles.id`.
- **`resolve_exchange_token(token text) → jsonb`** — returns
  `{valid, status, sourceDisplayName, sourceSlug}` for an exchange link
  landing page. Never returns any account id.
- **`claim_exchange_request(token text) → jsonb`** — lets a signed-in
  caller claim an exchange request using their own `auth.uid()` (not a
  client-supplied id). See `docs/GIFT_EXCHANGE_FLOW.md` for why this is
  a function rather than an RLS policy.
- **`complete_exchange_request(token text, referred_profile_slug text) → jsonb`**
  — marks a claimed request completed once the referred user has
  published their own profile.
- **`is_profile_published(p_profile_id uuid) → boolean`** — internal
  helper used by the storage policies (see below) so they can check
  publish status without needing a direct grant on `profiles`.

## Storage

Two private buckets: `avatars`, `wishlist-images`. Path convention:
`{bucket}/{profile_id}/...` (`profile_id` doubles as the owning user's
`auth.uid()`). Owners can read/write/delete their own files; anyone
(including anon) can *read* files under a profile that is currently
`published`, via `is_profile_published()` — draft/hidden profile images
stay inaccessible even if the exact URL leaks. Full detail in
`docs/RLS_POLICY_MATRIX.md`.

## Not yet built

- Application code that reads/writes any of this (Phase 3+).
- Real per-request rate limiting logic using `ai_usage_events` (the
  table exists; the limiting logic is server-side application code).
- Any admin/moderation UI for `profile_reports`.
