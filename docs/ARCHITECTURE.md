# Architecture

## Stack overview

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Auth / DB / Storage | Supabase (Postgres, Auth, Storage) |
| AI | Anthropic TypeScript SDK, called only from the server |
| Validation | Zod |
| Forms | React Hook Form + `@hookform/resolvers` (Zod resolver) |
| Icons | lucide-react |
| Class helpers | clsx, tailwind-merge |
| Hosting | Netlify |
| Package manager | npm |

## High-level structure

```
src/
  app/                 App Router routes (pages, layouts, route handlers)
  components/          Reusable, accessible UI components
  lib/
    supabase/           Supabase client factories (browser + server)
    ai/                 Anthropic SDK wrapper (server-only)
    validation/         Zod schemas
  types/                Shared TypeScript types
docs/                   Product & engineering documentation
```

## Rendering & data model

- Public profile pages (`/u/[slug]`) are server-rendered so they work
  without JavaScript-dependent client auth and load fast on mobile.
- Authenticated pages (`/dashboard`, `/profile/edit`, `/wishlist`,
  `/themes`, `/preview`, `/onboarding`) use Supabase Auth via
  `@supabase/ssr`, with session handled through cookies on the server.
  Each protected page calls `requireAuthUser()`
  (`src/lib/auth/dal.ts`) itself — not the shared layout — since Next's
  `error.tsx` boundaries don't catch errors thrown by a layout in the
  same segment, and layouts don't re-render on every client-side
  navigation.
- All database access enforces Row Level Security: a profile owner can
  read/write their own data; a public profile is exposed only through a
  narrow, explicitly public read policy keyed by its share slug. See
  `docs/RLS_POLICY_MATRIX.md`.

## Supabase usage

- **Auth**: email/password sign-up/login, with email confirmation,
  forgot/reset password, and sign-out. See `docs/AUTH_FLOW.md`.
- **Postgres**: stores profiles and their structured gift-profile
  sections (see `docs/DATABASE_SCHEMA.md`).
- **Storage**: profile avatars and wishlist item images (private
  buckets, public reads only for published profiles).
- Client access patterns:
  - Browser client (anon key) — `src/lib/supabase/client.ts` — for
    Client Components.
  - Server client (anon key, cookie-bound) —
    `src/lib/supabase/server.ts` — for Server Components, Server
    Actions, and Route Handlers acting as the signed-in user.
  - `src/proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`)
    refreshes the session cookie and does an optimistic
    redirect-if-unauthenticated on every request — a fast first line of
    defense, not the actual security boundary.
  - The service-role key is not used anywhere yet — every auth/database
    operation in this codebase runs as the signed-in user through RLS.
    If a future phase needs it (e.g. admin/moderation tooling), it must
    stay server-only and never be imported into client-bundled code.

## AI assistant integration

- The Anthropic SDK is only ever instantiated in server-side code (route
  handlers or server actions), using `ANTHROPIC_API_KEY` from the server
  environment.
- The client calls an internal API route; the API route calls Anthropic
  and returns a plain-text/JSON suggestion.
- Rate limiting: `AI_DAILY_USER_LIMIT` (signed-in users) and
  `AI_DAILY_GUEST_LIMIT` (anonymous visitors) cap daily requests to keep
  the free service sustainable.
- See `docs/AI_SAFETY.md` for behavioral guardrails.

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Marketing/landing page explaining the app |
| `/signup` | Public | Create an account (supports `?exchange=<token>`) |
| `/login` | Public | Sign in |
| `/forgot-password` | Public | Password reset request |
| `/reset-password` | Requires a recovery session | Set a new password after clicking the reset link |
| `/auth/confirm` | Public (Route Handler) | Verifies signup/recovery email links |
| `/onboarding` | Authenticated | Choose AI vs. manual profile building |
| `/dashboard` | Authenticated | Overview of the user's profile & links |
| `/profile/edit` | Authenticated | Edit gift-profile content |
| `/wishlist` | Authenticated | Manage exact wishlist items & dream gifts |
| `/themes` | Authenticated | Choose profile appearance/theme |
| `/preview` | Authenticated | Preview the public profile before sharing |
| `/u/[slug]` | Public | Shareable public gift profile + AI assistant |

## Deployment

- Netlify builds the Next.js app directly from the GitHub repository.
- Environment variables (see `.env.example`) are configured in Netlify's
  dashboard, never committed to the repo.
- No deployment is performed during this foundation phase.
