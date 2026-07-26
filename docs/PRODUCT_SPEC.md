# Product Specification — Gift Profile App

## Core message

> Better gifts. Less guessing.

## Problem

Friends and family want to give good gifts but usually have to guess: sizes,
tastes, what someone already owns, what they secretly want. Guessing leads to
wasted money, returns, and gifts that miss the mark.

## Solution

A free, mobile-first app where a person builds one digital "gift profile"
describing what they like and want. They share a single public link. Anyone
with the link — no account required — can view the profile, optionally get
help from an AI assistant to pick something, and (if they want to build their
own profile) create one with one tap.

## Who it's for

- Anyone who wants better gifts: birthdays, holidays, weddings, baby showers,
  "just because."
- Gift-givers (parents, partners, friends, coworkers) who want a fast,
  accurate way to know what to get someone.

## What the app is not

- Not a store. It never sells anything, lists prices as fact, or checks out
  a purchase.
- Not a monetized platform. No payments, subscriptions, ads, affiliate
  links, shopping carts, premium tiers, or ecommerce checkout — ever.
- Not a social network. There are no feeds, likes, comments, or follows —
  just a profile and a link.

## Core user stories

1. As a profile owner, I can sign up, build my gift profile, and edit it
   any time.
2. As a profile owner, I can share one public link (`/u/[slug]`) with
   anyone.
3. As a visitor with the link, I can view the profile without creating an
   account.
4. As a visitor, I can ask an AI assistant for help choosing a gift based on
   the profile's contents.
5. As a visitor, I can tap a button at the bottom of the profile to start
   creating my own profile.

## Gift profile contents

A profile can capture:

- Interests
- Favorite colors
- Clothing and shoe sizes
- Favorite stores and brands
- Foods, drinks, and candy
- General gift preferences (e.g. "prefers experiences over things")
- Exact wishlist items (specific things they want)
- Expensive "dream" gifts (aspirational, higher-cost items)
- Digital subscriptions (e.g. streaming, games, apps)
- Experiences (e.g. concerts, travel, classes)
- Things they dislike or already own (so people don't duplicate or miss)

## AI assistant

- Helps a visitor reason about what to gift, using only the profile's own
  content plus general knowledge of gift categories/ideas.
- Never invents specific product listings or URLs.
- Never states current prices or stock/availability as fact.
- Is an optional aid — every profile must be fully usable by a human
  reading it manually, with or without AI availability.

## Guiding constraints

- 100% free to end users, indefinitely, by design. No monetization
  features of any kind.
- No account required to view a profile or use the AI assistant on it.
- Mobile-first, accessible UI.
- Every public profile ends with a call-to-action for the viewer to create
  their own profile.
