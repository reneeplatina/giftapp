# CLAUDE.md — Project Rules for Gift Profile App

This file defines permanent rules for anyone (human or AI) working on this
codebase. These rules apply to every phase of development, not just the
current one.

## Core message

> One profile. Better gifts. Less guessing.

See `docs/PRODUCT_SPEC.md` for the full product definition.

## Before making changes

- Read the existing product documentation before making changes:
  `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`,
  `docs/DATABASE_PLAN.md`, and `docs/AI_SAFETY.md`.
- Explain any schema change before implementing it. Get confirmation before
  running it against a real database.

## Database rules

- Do not make destructive database changes (no dropping columns/tables,
  no destructive renames) without explicit approval.
- Use additive migrations. Prefer adding new columns/tables over altering
  or removing existing ones.
- Do not disable Row Level Security (RLS) on any table, ever.

## Secrets and security

- `ANTHROPIC_API_KEY` is server-only.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Neither key may ever be imported into a client component, sent to the
  browser, or referenced by anything in the `"use client"` bundle.
- No secrets may be committed to Git. Real values live in `.env.local`
  (git-ignored), not `.env.example`.

## Product integrity

- Do not implement fake buttons or placeholder actions that appear
  functional but do nothing. If a feature isn't built yet, don't fake it.
- Do not use AI-generated product links. If the AI assistant suggests a
  type of gift, it must not fabricate a URL to a specific product/listing.
- Do not claim prices or product availability are current. The AI can
  suggest ideas and categories, not real-time prices or stock status.
- Do not add monetization: no payments, subscriptions, ads, affiliate
  links, shopping carts, premium plans, or ecommerce checkout, at any phase.
- Do not remove or postpone the AI gift-assistant features.
- The application must continue to work manually (browsing a profile and
  picking a gift without AI help) if the AI service is unavailable.

## Engineering standards

- Keep components accessible (semantic HTML, labels, keyboard navigation,
  sufficient color contrast) and mobile-first.
- Run typecheck, lint, and tests after every phase.
- Stop after completing the requested phase. Do not start the next phase
  unless asked.

## Tech stack (do not change without discussion)

- Next.js (App Router) + React + TypeScript (strict mode)
- Tailwind CSS
- Supabase (auth, Postgres, storage)
- Anthropic TypeScript SDK (server-side only) for the AI assistant
- Zod for runtime validation
- React Hook Form for forms
- Netlify for deployment
- npm as the package manager
