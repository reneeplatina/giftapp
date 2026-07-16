# AI Safety & Behavior Rules

The AI gift assistant is an optional aid layered on top of a profile that
must already be fully usable without it. These rules are permanent and
apply to every phase that touches AI.

## Server-only key handling

- `ANTHROPIC_API_KEY` is read only in server-side code (route handlers,
  server actions). It must never be imported into a client component or
  bundled for the browser.
- The Anthropic TypeScript SDK client is instantiated once, server-side,
  in `src/lib/ai/`.
- The browser never talks to Anthropic directly — it calls an internal
  Next.js API route, which calls Anthropic.

## What the assistant may do

- Read the visitor-facing profile content (interests, sizes, favorites,
  wishlist, dream gifts, subscriptions, experiences, dislikes/owned
  items) and reason about which items or categories might make good
  gifts, and why.
- Ask clarifying questions (e.g. budget range, occasion) to narrow
  suggestions.
- Reference exact wishlist items the profile owner already entered
  themselves.

## What the assistant must never do

- Never fabricate a specific product listing, retailer page, or URL.
  Only URLs the profile owner explicitly entered (e.g. in a wishlist
  item) may be shown; the AI does not invent new ones.
- Never state a current price, discount, or stock/availability as fact.
  If asked, it should say it cannot confirm current pricing or
  availability and suggest the user check directly with the retailer.
- Never push the visitor toward checkout, purchase flows, payments, or
  any monetized action — this app has none.
- Never impersonate the profile owner or claim to know things about them
  beyond what's in their profile.

## Reliability & fallback

- The app must remain fully usable if the AI service is down, rate
  limited, or the API key is missing: the profile itself (interests,
  sizes, wishlist, etc.) is always visible and readable manually.
- If the AI request fails or a rate limit is hit, show a clear, friendly
  message and let the visitor keep browsing the profile — never block
  the page on the AI call.

## Rate limiting

- `AI_DAILY_USER_LIMIT`: max AI requests per signed-in user per day.
- `AI_DAILY_GUEST_LIMIT`: max AI requests per anonymous visitor per day
  (tracked server-side, not by trusting client-supplied identifiers).
- Limits exist to keep the assistant sustainable at zero cost to users,
  not to upsell a paid tier — there is no paid tier.

## Model configuration

- The specific model is configured via `ANTHROPIC_MODEL` (server env),
  not hardcoded, so it can be updated without a code change.
