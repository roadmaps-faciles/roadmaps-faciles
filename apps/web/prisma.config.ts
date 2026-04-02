import { defineConfig } from "prisma/config";

if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
  console.log("🚨 Prisma config loaded in dev mode.");
  const { loadEnvConfig } = await import("@next/env");
  loadEnvConfig(__dirname, true);
}

process.env._SEEDING = "true";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "pnpm tsx --tsconfig prisma/tsconfig.json prisma/seed.cts",
  },
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
