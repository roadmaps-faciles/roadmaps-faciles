import { PrismaPg } from "@prisma/adapter-pg";

import { config } from "@/config";
import { PrismaClient } from "@/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient; prismaPg: PrismaPg };
const isProd = config.env === "prod";

const adapter =
  globalForPrisma.prismaPg ||
  new PrismaPg({
    connectionString: config._dbUrl,
  });

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: !isProd
      ? [
          // "query",
          //
          "info",
          "warn",
          "error",
        ]
      : ["error"],
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPg = adapter;
}
