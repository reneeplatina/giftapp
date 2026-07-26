// Test-only stand-in for the "server-only" package. The real package
// throws unconditionally when imported outside a Next.js server bundle
// (it relies on webpack aliasing to no-op server-side); under vitest
// there's no Next.js bundler doing that aliasing, so we alias it to this
// empty module instead (see vitest.config.ts). It exists purely as a
// dev-time guard against client-bundling mistakes, so a no-op here is safe.
export {};
