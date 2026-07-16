# Implementation Plan

This plan is phased. Each phase should be proposed, built, and confirmed
before moving to the next. Do not skip ahead — see the rule in `CLAUDE.md`:
"Stop after completing the requested phase."

## Phase 0 — Project Foundation (this phase)

- Scaffold Next.js (App Router, TypeScript strict, Tailwind, ESLint, `src/`,
  `@/*` alias).
- Install core dependencies (Supabase, Anthropic SDK, Zod, React Hook Form,
  lucide-react, clsx, tailwind-merge).
- Add project documentation (this set of docs) and `.env.example`.
- Add a minimal, compiling application shell (no real pages yet).
- No real Supabase project, no Anthropic key, no auth, no migrations, no
  deployment.

## Phase 1 — Database & Auth Foundation

- Design and document the Postgres schema in detail (extending
  `docs/DATABASE_PLAN.md`).
- Create a real Supabase project (with user's involvement/approval).
- Write additive SQL migrations with Row Level Security policies.
- Wire up Supabase Auth: sign up, login, forgot password, session
  middleware.
- Build `/signup`, `/login`, `/forgot-password` with real behavior.

## Phase 2 — Gift Profile CRUD

- Build `/profile/edit` to create/edit all profile sections (interests,
  sizes, favorites, wishlist, dream gifts, subscriptions, experiences,
  dislikes/owned items).
- Build `/dashboard` as the authenticated home base.
- Build `/wishlist` for managing exact wishlist items and dream gifts in
  more detail.
- Zod schemas + React Hook Form for every form, with accessible
  validation messaging.

## Phase 3 — Public Profile & Sharing

- Build `/u/[slug]` public, unauthenticated, server-rendered profile view.
- Build `/preview` so an owner can see their profile as a visitor would.
- Build `/themes` for basic appearance customization.
- Add the "Create your own profile" call-to-action at the bottom of every
  public profile.

## Phase 4 — AI Gift Assistant

- Server-side Anthropic integration behind an internal API route.
- Guardrails per `docs/AI_SAFETY.md` (no fabricated links/prices/
  availability).
- Daily rate limiting for signed-in users and guests.
- Graceful manual fallback when AI is unavailable or rate-limited.

## Phase 5 — Polish, Accessibility, and Launch Readiness

- Accessibility pass (semantics, focus states, contrast, screen reader
  labels) across all pages.
- Mobile-first responsive pass.
- Netlify deployment configuration and environment variables.
- Final review against `CLAUDE.md` rules before going live.

## Out of scope, permanently

- Payments, subscriptions, ads, affiliate links, shopping carts, premium
  plans, ecommerce checkout.
- AI-fabricated product links, prices, or availability claims.
