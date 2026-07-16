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
  `/themes`, `/preview`) use Supabase Auth via `@supabase/ssr`, with
  session handled through cookies on the server.
- All database access enforces Row Level Security: a profile owner can
  read/write their own data; a public profile is exposed only through a
  narrow, explicitly public read policy keyed by its share slug.

## Supabase usage

- **Auth**: email/password (and optionally magic link) sign-up/login.
- **Postgres**: stores profiles and their structured gift-profile
  sections (see `docs/DATABASE_PLAN.md`).
- **Storage**: optional profile photo / theme assets.
- Client access patterns:
  - Browser client (anon key) for authenticated user actions in client
    components.
  - Server client (anon key, cookie-bound) for server components/route
    handlers acting as the signed-in user.
  - Service-role client (service role key) only for trusted server-side
    operations that must bypass RLS (e.g. admin tasks) — never used to
    serve public/browser requests directly, and never imported into any
    client-bundled code.

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
| `/signup` | Public | Create an account |
| `/login` | Public | Sign in |
| `/forgot-password` | Public | Password reset request |
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
