import "server-only";
import * as Sentry from "@sentry/nextjs";

import { type RequestContext } from "./audit";

/**
 * Enrich the current Sentry scope with correlation ID and request context.
 * Call this at the start of server actions / route handlers, after `getRequestContext()`.
 */
export function enrichSentryScope(reqCtx: RequestContext): void {
  Sentry.getCurrentScope().setTag("correlation_id", reqCtx.correlationId);

  if (reqCtx.ipAddress) {
    Sentry.getCurrentScope().setTag("ip_address", reqCtx.ipAddress);
  }
}
