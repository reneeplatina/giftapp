import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile/edit",
  "/wishlist",
  "/themes",
  "/preview",
  "/onboarding",
];

const AUTH_ONLY_WHEN_SIGNED_OUT = ["/login", "/signup"];

/**
 * Refreshes the Supabase session on every request (so it doesn't expire
 * silently) and does an optimistic redirect for protected/auth-only
 * routes. This is a fast, cookie/network round-trip only — it is not
 * the actual security boundary. Every protected page and Server Action
 * re-checks the session itself (src/lib/auth/dal.ts), and Postgres RLS
 * is the real backstop regardless of any bug here.
 */
let warnedMissingConfig = false;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Without real Supabase credentials there is no session to refresh or
  // check — let every request through unauthenticated rather than
  // hard-failing the entire site (createServerClient() throws
  // synchronously if these are missing). Protected pages still redirect
  // via src/lib/auth/dal.ts's requireAuthUser(), which fails the same
  // way any other Supabase-backed page load would without credentials.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    if (!warnedMissingConfig) {
      console.warn(
        "[proxy] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — skipping session refresh and route protection until a real Supabase project is connected.",
      );
      warnedMissingConfig = true;
    }
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token against the Supabase Auth
  // server (unlike reading the cookie alone), and must be called before
  // any redirect decision is made.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthOnlyWhenSignedOut = AUTH_ONLY_WHEN_SIGNED_OUT.some(
    (path) => pathname === path,
  );

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthOnlyWhenSignedOut && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
