import { PrismaPg } from "@prisma/adapter-pg";

import { config } from "@/config";
import { PrismaClient } from "@/prisma/client";
import { DatabaseUnavailableError, JsonifiedError } from "@/utils/error";

const isProd = config.env === "prod";

const PRISMA_CONNECTION_ERROR_NAMES = new Set(["PrismaClientInitializationError", "PrismaClientRustPanicError"]);
const PRISMA_CONNECTION_ERROR_CODES = new Set(["ECONNREFUSED", "ETIMEDOUT", "P1001", "P1002", "P1017"]);

function isPrismaConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (PRISMA_CONNECTION_ERROR_NAMES.has(error.name)) return true;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && PRISMA_CONNECTION_ERROR_CODES.has(code);
}

const initialGlobal = globalThis as unknown as { prisma?: unknown; prismaPg?: PrismaPg };

const adapter = initialGlobal.prismaPg ?? new PrismaPg({ connectionString: config._dbUrl });

function createPrismaClient() {
  return new PrismaClient({
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
  }).$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return await query(args);
        } catch (error) {
          if (isPrismaConnectionError(error)) {
            const message = error instanceof Error ? error.message : "Database unreachable";
            throw new JsonifiedError(new DatabaseUnavailableError(message));
          }
          throw error;
        }
      },
    },
  });
}

type ExtendedPrisma = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrisma; prismaPg: PrismaPg };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (!isProd) {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPg = adapter;
}
