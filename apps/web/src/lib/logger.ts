import "server-only";
import pino from "pino";

import { config } from "@/config";

const isDev = config.env === "dev";

// In dev, Turbopack/HMR re-evaluates this module across route bundles and recompiles.
// Each re-eval would re-spawn the pino-pretty worker transport, stacking `finish`
// listeners on process.stdout until Node emits MaxListenersExceededWarning. Caching
// the instance on globalThis keeps a single logger (and a single transport) alive.
const globalForLogger = globalThis as unknown as { __rfLogger?: pino.Logger };

export const logger: pino.Logger =
  globalForLogger.__rfLogger ??
  (globalForLogger.__rfLogger = pino({
    level: config.observability.logLevel,
    ...(isDev
      ? {
          transport: {
            target: "pino-pretty",
          },
        }
      : {}),
    base: {
      service: "roadmaps-faciles",
      version: config.appVersion,
      env: config.env,
    },
  }));

export type Logger = pino.Logger;
