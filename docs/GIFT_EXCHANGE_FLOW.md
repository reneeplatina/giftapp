# Gift Exchange Request Flow

This documents the `gift_exchange_requests` table and its functions —
the database-layer support for "share your profile, ask them to build
and send back their own." The frontend for this flow is **not built
yet**; this phase only creates the data model and access rules.

## Why a separate flow from a plain share link

A plain public profile link (`/u/[slug]`) is enough for someone to view
your profile. The exchange flow adds a light, trackable request: "I sent
you my profile — did you make one back?" without ever collecting the
recipient's contact info. `gift_exchange_requests` stores only a
`recipient_label` (a free-text note like "Mom" the sender types for
their own reference) — never a phone number or email address.

## Lifecycle

```
created --------> started --------> completed
   |                  |
   +---- cancelled <--+
```

1. **`created`** — the source profile owner generates a request
   (`exchange_token` is a random 48-character hex string, unrelated to
   any user id — see "Token design" below) and shares the resulting
   link. `share_count`/`last_shared_at` can be bumped each time they
   re-share it.
2. **`started`** — someone opens the link and, once signed in, calls
   `claim_exchange_request(token)`. This sets `referred_user_id` to
   their own account and `started_at`.
3. **`completed`** — once the referred user has built and published
   their own profile, `complete_exchange_request(token, their_slug)`
   sets `referred_profile_id` and `completed_at`.
4. **`cancelled`** — the source owner can cancel at any time via a plain
   table update (they always have full owner access to their own
   requests).

## Token design

`exchange_token` is generated with `encode(gen_random_bytes(24), 'hex')`
— 192 bits of randomness from `pgcrypto`, rendered as 48 lowercase hex
characters (enforced by a CHECK constraint). It is:

- **Random** — not derived from `source_profile_id`, a timestamp, or
  anything guessable.
- **Unique** — enforced by a unique index.
- **URL-safe** — plain hex, no encoding concerns.
- **The actual authorization credential** for the flow: possessing the
  token is what lets someone resolve and claim a request, the same way
  a password-reset link works.

## Why claiming is a function, not an RLS policy

The obvious-looking RLS policy for "a referred user may complete a valid
request" would be something like:

```sql
-- Unsafe — do not do this.
create policy ... for update
  using (referred_user_id is null or referred_user_id = auth.uid())
  with check (referred_user_id = auth.uid());
```

The problem: RLS's `USING` clause governs which rows a client's query is
*allowed* to touch at all — it does not know or care whether the request
included the correct token in its `WHERE` clause. Any authenticated user
could run `UPDATE gift_exchange_requests SET referred_user_id = auth.uid()
WHERE status = 'created'` and this policy would let them mass-claim
*every* open request in the table, not just the one they were actually
sent.

Instead, `claim_exchange_request(token)` is a `SECURITY DEFINER`
function: it takes the token as an explicit argument, looks up the
matching row itself, and uses `auth.uid()` — the caller's real,
server-verified identity, not a client-supplied value — to set
`referred_user_id`. The token is the credential; `auth.uid()` is the
identity; neither can be substituted by the caller. This was verified
directly: a third user who does not have the token gets
`{claimed: false, reason: "already_claimed"}` (or `"not_found"`/
`"not_available"` for other invalid tokens) and cannot see the row via
ordinary `select` either (see `docs/RLS_POLICY_MATRIX.md`).

`complete_exchange_request()` follows the same pattern, and additionally
checks that the caller (`auth.uid()`) is the same user who already
claimed the request before letting them mark it completed.

## What a visitor-facing "resolve" call sees

`resolve_exchange_token(token)` is the only anon-reachable read for this
flow. It intentionally returns very little:

```json
{
  "valid": true,
  "status": "started",
  "sourceDisplayName": "Renee",
  "sourceSlug": "renee"
}
```

`valid` is `true` only for `created`/`started` requests — a cancelled or
completed request (or a token that doesn't exist at all) reports
`valid: false`. It never returns `source_profile_id`, `referred_user_id`,
`referred_profile_id`, or any other account identifier.

## Not yet built

- Any UI for generating, sharing, or landing on an exchange link
  (Phase 3+).
- `share_count`/`last_shared_at` bumping logic (straightforward owner
  update once there's a UI to drive it).
