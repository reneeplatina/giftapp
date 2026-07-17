# Gift Profile App

> One profile. Better gifts. Less guessing.

A free, mobile-first app where you build a gift profile (interests, sizes,
favorite stores, wishlist, dream gifts, and more) and share one link with
friends and family — no account needed to view it. Visitors can also use an
AI assistant to help pick a gift.

This app is completely free: no payments, subscriptions, ads, affiliate
links, or shopping carts.

**Project status:** the mobile-first frontend is built using typed mock
data (no backend wired up yet), and the Supabase database schema exists as
local migration files (not yet connected to the frontend or a real
project). See `docs/IMPLEMENTATION_PLAN.md` for what's next.

## Documentation

- `docs/PRODUCT_SPEC.md` — what the app is and isn't
- `docs/ARCHITECTURE.md` — technical design and route map
- `docs/IMPLEMENTATION_PLAN.md` — phased build plan
- `docs/DATABASE_SCHEMA.md` — the actual database schema
- `docs/RLS_POLICY_MATRIX.md` — Row Level Security policies, table by table
- `docs/GIFT_EXCHANGE_FLOW.md` — the gift-exchange-request data model
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

## Deployment

This project is intended to deploy to [Netlify](https://www.netlify.com/),
connected to this GitHub repository. Deployment isn't set up yet.
