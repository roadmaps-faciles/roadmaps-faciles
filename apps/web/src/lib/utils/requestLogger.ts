import "server-only";

import { logger, type Logger } from "@/lib/logger";

import { type RequestContext } from "./audit";

export function createRequestLogger(reqCtx: RequestContext, extra?: Record<string, unknown>): Logger {
  return logger.child({
    correlationId: reqCtx.correlationId,
    ...extra,
  });
}
