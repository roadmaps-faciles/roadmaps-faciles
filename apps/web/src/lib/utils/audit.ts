import "server-only";
import { headers } from "next/headers";

import { type Prisma } from "@/prisma/client";
import { type AuditAction } from "@/prisma/enums";

import { logger } from "../logger";
import { auditLogRepo } from "../repo";

export { AuditAction } from "@/prisma/enums";

export type RequestContext = {
  correlationId: string;
  ipAddress: null | string;
  userAgent: null | string;
};

export type AuditInput = {
  action: AuditAction;
  metadata?: Record<string, unknown>;
} & Omit<Prisma.AuditLogCreateInput, "action" | "ipAddress" | "metadata" | "userAgent">;

export async function getRequestContext(): Promise<RequestContext> {
  const h = await headers();
  return {
    correlationId: h.get("x-correlation-id") ?? crypto.randomUUID(),
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
    userAgent: h.get("user-agent"),
  };
}

export function audit(input: AuditInput, reqCtx: RequestContext): void {
  const metadata = {
    ...input.metadata,
    correlationId: reqCtx.correlationId,
  };

  auditLogRepo
    .create({
      ...input,
      metadata: metadata as Prisma.InputJsonValue,
      ipAddress: reqCtx.ipAddress,
      userAgent: reqCtx.userAgent,
    })
    .catch(err => {
      logger.warn({ err, correlationId: reqCtx.correlationId }, "Failed to write audit log");
    });
}
