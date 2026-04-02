import { vi } from "vitest";

// Mock `server-only` — ce module throw si importé hors RSC
vi.mock("server-only", () => ({}));

// Mock du logger pino — éviter les logs en test
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
    trace: vi.fn(),
    child: vi.fn().mockReturnThis(),
  },
}));
