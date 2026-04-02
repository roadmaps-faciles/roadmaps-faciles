import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "unit",
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    css: false,
  },
  resolve: {
    alias: {
      "@roadmaps-faciles/ui": new URL("./src/index.ts", import.meta.url).pathname,
    },
  },
});
