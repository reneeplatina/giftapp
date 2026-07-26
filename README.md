# Gift Profile App

> One profile. Better gifts. Less guessing.

A free, mobile-first app where you build a gift profile (interests, sizes,
favorite stores, wishlist, dream gifts, and more) and share one link with
friends and family — no account needed to view it. Visitors can also use an
AI assistant to help pick a gift.

This app is completely free: no payments, subscriptions, ads, affiliate
links, or shopping carts.

**Project status:** authentication (sign-up, sign-in, email confirmation,
password reset, sign-out, protected routes) is fully implemented in code
against Supabase Auth, but **no real Supabase project is connected yet** —
see "Connecting a real Supabase project" below to make it functional.
`/profile/edit`, `/wishlist`, `/themes`, and `/preview` are auth-protected
but still show Phase 1's typed mock data. See `docs/IMPLEMENTATION_PLAN.md`
for what's next.

## Documentation

- `docs/PRODUCT_SPEC.md` — what the app is and isn't
- `docs/ARCHITECTURE.md` — technical design and route map
- `docs/IMPLEMENTATION_PLAN.md` — phased build plan
- `docs/DATABASE_SCHEMA.md` — the actual database schema
- `docs/RLS_POLICY_MATRIX.md` — Row Level Security policies, table by table
- `docs/GIFT_EXCHANGE_FLOW.md` — the gift-exchange-request data model
- `docs/AUTH_FLOW.md` — how sign-up/sign-in/session/exchange-context work
- `docs/DATABASE_PLAN.md` — early planning draft (superseded, kept for history)
- `docs/AI_SAFETY.md` — rules for the AI assistant
- `CLAUDE.md` — permanent engineering rules for this project

## Local setup

### 1. Install the right Node.js version

This project targets the Node version in `.nvmrc`. If you use
[nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in real values once they exist (not needed
yet for this foundation phase):

```bash
cp .env.example .env.local
```

`.env.local` is ignored by Git and should never be committed.

### 4. Run the app locally

```bash
npm run dev
```

Then open <http://localhost:3000> in your browser.

### Other useful commands

```bash
npm run lint   # check code style and common mistakes
npm run build  # create a production build
```

## Database (Supabase)

The schema lives in `supabase/migrations/*.sql` (plus `supabase/seed.sql`
for local sample data). It has **not** been applied to any real project —
nothing in this repo touches a live database yet. To try it locally once
you have the [Supabase CLI](https://supabase.com/docs/guides/cli) and
Docker installed:

```bash
supabase start   # spins up a local Supabase stack
supabase db reset  # applies every migration, then supabase/seed.sql
```

See `docs/DATABASE_SCHEMA.md` and `docs/RLS_POLICY_MATRIX.md` for what
this creates. `src/types/database.ts` is hand-written to match — once a
project is linked, regenerate it with:

```bash
supabase gen types typescript --local > src/types/database.ts
```

## Connecting a real Supabase project

Without this, every page that needs Supabase (anything under sign-up,
sign-in, or the authenticated app section) shows a friendly "we couldn't
reach the server" message instead of working — the public landing page
and public profile pages work fine either way.

1. Create a project at [supabase.com](https://supabase.com) (free tier is
   enough for development).
2. In the project dashboard, go to **Project Settings → API** and copy
   the **Project URL** and the **anon/public key**.
3. Copy `.env.example` to `.env.local` (if you haven't already) and fill
   in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with
   those two values. Leave `SUPABASE_SERVICE_ROLE_KEY` blank — nothing in
   this codebase uses it yet.
4. Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` for local dev
   (this is used to build the email confirmation/reset links Supabase
   sends).
5. Apply the migrations to that project: install the
   [Supabase CLI](https://supabase.com/docs/guides/cli), then run
   `supabase link --project-ref <your-project-ref>` (found in the same
   API settings page) followed by `supabase db push`. Alternatively,
   paste each file in `supabase/migrations/` (in order) into the
   dashboard's **SQL Editor** and run them one at a time.
6. In the dashboard under **Authentication → URL Configuration**, add
   `http://localhost:3000/auth/confirm` as a redirect URL — Supabase
   rejects confirmation/reset links to URLs that aren't allow-listed.
7. Restart `npm run dev`. Sign-up/sign-in/password reset should now work
   end-to-end. By default Supabase requires email confirmation — real
   emails only send from Supabase's dashboard/CLI-configured mail
   provider, so for quick local testing you can turn off "Confirm email"
   under **Authentication → Sign In / Providers → Email** instead.

## Deployment

This project is intended to deploy to [Netlify](https://www.netlify.com/),
connected to this GitHub repository. Deployment isn't set up yet.
