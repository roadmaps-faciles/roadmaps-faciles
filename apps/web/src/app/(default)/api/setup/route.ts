import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { config } from "@/config";
import { createMinimalInstance } from "@/lib/bootstrap";
import { logger } from "@/lib/logger";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/utils/passwordConstants";

const SetupInput = z
  .object({
    adminEmail: z.email().optional(),
    adminName: z.string().min(1).max(100).optional(),
    adminPassword: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).optional(),
    adminUsername: z.string().min(1).max(100).optional(),
    tenantName: z.string().min(1).max(100).optional(),
    tenantSubdomain: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
  })
  .strict();

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(request: Request) {
  if (!config.security.setupToken) {
    return NextResponse.json(
      { error: "Setup endpoint désactivé. Définir SETUP_TOKEN pour l'activer." },
      { status: StatusCodes.FORBIDDEN },
    );
  }

  const provided = request.headers.get("x-setup-token") ?? "";
  if (!safeEqual(provided, config.security.setupToken)) {
    return NextResponse.json({ error: "Jeton de setup invalide." }, { status: StatusCodes.UNAUTHORIZED });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: StatusCodes.BAD_REQUEST });
  }

  const parsed = SetupInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const result = await createMinimalInstance(parsed.data);
    if (result.alreadyInitialized) {
      return NextResponse.json({ error: "Instance déjà initialisée.", ok: false }, { status: StatusCodes.CONFLICT });
    }
    logger.info(
      { adminEmail: result.adminEmail, tenantId: result.tenantId },
      "Self-host instance bootstrapped via /api/setup",
    );
    return NextResponse.json(
      { adminEmail: result.adminEmail, loginUrl: `${config.host}/login`, ok: true, tenantId: result.tenantId },
      { status: StatusCodes.CREATED },
    );
  } catch (error) {
    logger.error({ err: error }, "Bootstrap via /api/setup failed");
    return NextResponse.json(
      { error: (error as Error).message, ok: false },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
