/**
 * Single source of truth for reserved profile slugs, mirrored by the
 * profiles_slug_not_reserved CHECK constraint in
 * supabase/migrations/20260717000002_profiles.sql. Postgres CHECK
 * constraints aren't introspectable as a plain array at runtime, so this
 * is kept in sync by hand — both server-side generation (slug.ts) and
 * client-side form validation (validation/profile.ts) import this same
 * list so neither can drift from the other or from the database.
 */
export const RESERVED_SLUGS = [
  "admin", "api", "app", "auth", "dashboard", "login", "logout",
  "signup", "signin", "sign-up", "sign-in", "forgot-password",
  "settings", "help", "support", "about", "contact", "terms",
  "privacy", "pricing", "billing", "blog", "docs", "static",
  "public", "assets", "u", "profile", "profiles", "wishlist",
  "themes", "preview", "null", "undefined", "www", "root",
] as const;
