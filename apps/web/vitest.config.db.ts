import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
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
    include: ["tests/testdb/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts", "./tests/testdb/setup.ts"],
    pool: "forks",
    fileParallelism: false,
    testTimeout: 10000,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL_TEST || "postgresql://postgres:postgres@localhost:5432/roadmaps-faciles-test",
    },
  },
});
