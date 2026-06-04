import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Le tsconfig Next utilise `jsx: preserve` ; sans override, l'analyse de graphe `--changed`
  // ne transforme pas le JSX des templates email (.tsx) et plante au parse. Vite 8 transforme
  // via oxc, on force donc la transformation JSX côté oxc.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: {
      "@/config": path.resolve(__dirname, "src/config.ts"),
      "@/gouv/dsfr/client": path.resolve(__dirname, "src/gouv/dsfr/client.ts"),
      "@/gouv/dsfr/utils": path.resolve(__dirname, "src/gouv/dsfr/utils"),
      "@/gouv/dsfr": path.resolve(__dirname, "src/gouv/dsfr/server.ts"),
      "@/prisma": path.resolve(__dirname, "src/generated/prisma"),
      "@/utils": path.resolve(__dirname, "src/lib/utils"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/testu/**/*.test.ts", "tests/testi/**/*.test.ts"],
    exclude: ["node_modules", ".next", "src/generated/**", "tests/teste2e/**"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/useCases/**", "src/lib/utils/**", "src/lib/model/**"],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 35,
        lines: 50,
      },
    },
  },
});
