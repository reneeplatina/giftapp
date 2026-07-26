# Authentication Flow

## Stack

- `@supabase/ssr` for the browser/server client split, following
  Supabase's current recommended Next.js App Router pattern.
- `src/proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`
  (same mechanism, new name/export). Refreshes the session cookie and
  does an **optimistic** redirect for protected/auth-only routes on
  every request. This is a fast first line of defense, not the
  authoritative check.
- `src/lib/auth/dal.ts` — the actual security boundary. `getAuthUser()`
  always calls `supabase.auth.getUser()` (never `getSession()`), which
  revalidates the token against the Supabase Auth server rather than
  trusting the cookie. `requireAuthUser()` redirects to `/login` if
  there's no valid session.
- Every protected page calls `requireAuthUser()` itself — not the
  shared `(app)/layout.tsx`. Next's `error.tsx` boundaries don't catch
  errors thrown by a layout in the same route segment (only by its page
  and below), and per Next's own guidance, layouts don't re-render on
  every client-side navigation. Checking in each page avoids both
  problems.
- Postgres RLS (`docs/RLS_POLICY_MATRIX.md`) is the ultimate backstop
  regardless of any bug in the above — every query still runs as the
  signed-in user through the anon key, never the service-role key.

## Sign-up

1. `signUpAction` (`src/lib/auth/actions.ts`) validates the form with
   the same Zod schema as Phase 1's mock form, then calls
   `supabase.auth.signUp()`, storing `display_name` and (if present)
   `exchange_token` in the new user's `user_metadata` — this survives
   the email-confirmation round trip without needing any new database
   columns.
2. **If email confirmation is required** (Supabase project default):
   the user sees a "check your email" screen with a resend option.
   Clicking the email link hits `/auth/confirm`, which calls
   `supabase.auth.verifyOtp({token_hash, type: "signup"})`, then
   `ensureProfileExists()`, then redirects to `/onboarding`.
3. **If email confirmation is disabled** for the project: `signUp()`
   returns a session immediately, so `signUpAction` calls
   `ensureProfileExists()` and redirects to `/onboarding` directly.
4. **Existing email**: Supabase's `signUp()` deliberately returns a
   "success" response (not an error) for an email that's already
   registered, to avoid leaking account existence — the documented
   signal is an empty `identities` array. `signUpAction` checks for this
   and shows a friendly "that email may already have an account" message
   instead of silently pretending to succeed.

`ensureProfileExists()` (`src/lib/profile/ensure-profile.ts`) creates
the `profiles` row (`status: "draft"`, a slug generated from the display
name via `generateUniqueSlug()`) if one doesn't already exist — safe to
call more than once. If an exchange token is present, it calls
`claim_exchange_request()` (best-effort — an invalid/expired token never
blocks account creation).

## Sign-in

`signInAction` calls `signInWithPassword()`. An unconfirmed-email error
routes to the same "check your email" screen as sign-up (with resend).
On success, `ensureProfileExists()` runs defensively (a no-op for an
existing profile), then redirects to `?redirect=` if present (set by
`proxy.ts` when it bounced an unauthenticated request) or `/dashboard`.

## Forgot / reset password

- `requestPasswordResetAction` calls `resetPasswordForEmail()` and
  **always** returns the same message regardless of the outcome —
  including genuine Supabase-side errors — so this flow never confirms
  or denies whether an email is registered.
- The reset link also lands on `/auth/confirm`
  (`type: "recovery"`), which establishes a recovery session and
  redirects to `/reset-password`. That page checks server-side for a
  session and bounces to `/forgot-password?error=expired_link` if
  there isn't one (i.e. the link was invalid or already used).
- `updatePasswordAction` calls `updateUser({password})` on that
  recovery session, then redirects to `/dashboard`.

## Sign-out

A plain Server Action (`signOutAction`) calling `supabase.auth.signOut()`
then redirecting to `/login`. Available from the sidebar (desktop) and a
compact top bar (mobile, since the bottom nav is full).

## Gift-exchange context through sign-up

`/signup?exchange=<token>` — the signup page (a Server Component) calls
the `resolve_exchange_token` database function (see
`docs/GIFT_EXCHANGE_FLOW.md`) server-side before rendering, and passes
the result into the client form:

- **Valid**: a banner names the source profile ("You're signing up from
  Renee's gift exchange invite...") and the token travels through the
  form as a hidden field → `user_metadata` → `ensureProfileExists()` →
  `claim_exchange_request()`.
- **Invalid or cancelled**: a distinct, honest banner explains the link
  isn't valid/was cancelled, but sign-up proceeds normally — a bad
  exchange link never blocks someone from creating their own profile.
- The resolver only ever returns `{valid, status, sourceDisplayName,
  sourceSlug}` — never the source account's id — so nothing about the
  inviter's account is exposed to the browser.

## Friendly states implemented

Invalid credentials, existing email, expired/invalid confirmation or
reset link, missing email confirmation (with resend), network/
connectivity failure (page-level `error.tsx` boundaries in every route
group, since without a reachable Supabase project every auth-dependent
page load fails the same way), invalid exchange link, cancelled exchange
link. Password recovery never leaks account existence (task-specific
requirement, see above).

## What's not connected yet

- `/profile/edit`, `/wishlist`, `/themes`, `/preview` are now
  auth-protected but still render Phase 1's typed mock data — reading
  and writing real `profile_sections`/`wishlist_items` rows is the next
  phase's work.
- The AI interview (`onboarding`'s "Build It With AI" option is an
  honest "coming soon" dialog, not a real feature yet).
