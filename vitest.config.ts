import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "server-only" throws unless a bundler aliases it away server-side
      // (that's how Next.js enforces the guard); no-op it for tests. See
      // test/server-only-shim.ts.
      "server-only": path.resolve(__dirname, "./test/server-only-shim.ts"),
    },
  },
  test: {
    environment: "node",
  },
});
