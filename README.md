# Gift Profile App

> One profile. Better gifts. Less guessing.

A free, mobile-first app where you build a gift profile (interests, sizes,
favorite stores, wishlist, dream gifts, and more) and share one link with
friends and family — no account needed to view it. Visitors can also use an
AI assistant to help pick a gift.

This app is completely free: no payments, subscriptions, ads, affiliate
links, or shopping carts.

**Project status:** foundation phase. The project is scaffolded, documented,
and ready for development, but the real pages (sign up, dashboard, editing
your profile, the AI assistant, etc.) haven't been built yet. See
`docs/IMPLEMENTATION_PLAN.md` for what's next.

## Documentation

- `docs/PRODUCT_SPEC.md` — what the app is and isn't
- `docs/ARCHITECTURE.md` — technical design and route map
- `docs/IMPLEMENTATION_PLAN.md` — phased build plan
- `docs/DATABASE_PLAN.md` — planned database structure (draft)
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

## Deployment

This project is intended to deploy to [Netlify](https://www.netlify.com/),
connected to this GitHub repository. Deployment isn't set up yet.
