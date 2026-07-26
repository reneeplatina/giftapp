# Database Plan (Draft — superseded)

> **Superseded by `docs/DATABASE_SCHEMA.md`**, `docs/RLS_POLICY_MATRIX.md`,
> and `docs/GIFT_EXCHANGE_FLOW.md`, which document the actual migrations
> in `supabase/migrations/`. Kept here for history — the draft below was
> the starting point before the schema grew to include the AI interview,
> AI suggestions, gift exchange, usage-log, and moderation-report tables.

This was a planning document only, written before any migrations
existed. Schema changes must be explained and approved before
implementation (see `CLAUDE.md`).

## Principles

- Every table that stores user data has Row Level Security enabled, with
  no exceptions.
- Migrations are additive: add tables/columns rather than altering or
  dropping existing ones once data exists.
- A profile's public visibility is controlled by an explicit "published"
  flag and a unique `slug`, not by disabling RLS.

## Planned tables (subject to refinement in Phase 1)

### `profiles`

One row per user account (linked 1:1 to `auth.users`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | matches `auth.users.id` |
| `slug` | text, unique | used in `/u/[slug]` |
| `display_name` | text | |
| `is_published` | boolean | controls public visibility |
| `theme` | text | selected theme key |
| `created_at` / `updated_at` | timestamptz | |

RLS: owner can read/write their own row. Public (anon) can read only
published rows, and only the columns needed to render the public view.

### `profile_sections`

Flexible storage for the gift-profile content areas (interests, colors,
sizes, favorite stores/brands, foods/drinks/candy, gift preferences,
dislikes/owned items, digital subscriptions, experiences).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `profile_id` | uuid, FK -> `profiles.id` | |
| `section_type` | text | e.g. `interests`, `sizes`, `favorites` |
| `data` | jsonb | shape validated by Zod at the application layer |
| `created_at` / `updated_at` | timestamptz | |

RLS: owner can read/write their own sections. Public (anon) can read
sections belonging to a published profile only.

### `wishlist_items`

Exact wishlist items and expensive "dream gifts" (distinguished by a
`kind` column) — kept separate from `profile_sections` since they are
more structured (name, notes, optional link, approximate price band,
priority).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `profile_id` | uuid, FK -> `profiles.id` | |
| `kind` | text | `wishlist` \| `dream_gift` |
| `title` | text | |
| `notes` | text, nullable | |
| `url` | text, nullable | user-supplied only, never AI-generated |
| `created_at` / `updated_at` | timestamptz | |

RLS: owner can read/write their own items. Public (anon) can read items
belonging to a published profile only.

### `ai_usage`

Tracks daily AI assistant usage for rate limiting (`AI_DAILY_USER_LIMIT`,
`AI_DAILY_GUEST_LIMIT`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `subject_key` | text | user id or a hashed guest identifier |
| `usage_date` | date | |
| `request_count` | int | |

RLS: no public access; read/write only via server-side (service-role)
logic, never exposed to the browser.

## Not yet decided

- Exact `section_type` enum values and their `data` JSON shapes.
- Whether guest AI usage is tracked by IP hash, cookie id, or both.
- Storage bucket layout for optional profile photos/theme assets.

These will be finalized and documented before Phase 1 migrations are
written.
