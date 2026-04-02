import { encode } from "@auth/core/jwt";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";

/**
 * Test-only route that creates a session for E2E tests.
 * Only available when APP_ENV is "dev" or "test".
 *
 * POST /api/test-auth
 * Body: { email: string }
 * Returns: { ok: true } + sets authjs.session-token cookie
 */
export async function POST(request: Request) {
  if (config.env !== "dev" && process.env.E2E_TEST !== "true") {
    return NextResponse.json({ error: "Not available in production" }, { status: StatusCodes.FORBIDDEN });
  }

  const body = (await request.json()) as { email: string };
  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: StatusCodes.BAD_REQUEST });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      isBetaGouvMember: true,
      twoFactorEnabled: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: StatusCodes.NOT_FOUND });
  }

  const token = await encode({
    token: {
      sub: user.id,
      name: user.name,
      email: user.email,
      picture: null,
      uuid: user.id,
      role: user.role,
      status: user.status,
      isBetaGouvMember: user.isBetaGouvMember,
      isSuperAdmin: user.role === "ADMIN",
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorVerified: true,
      twoFactorRequired: false,
    },
    secret: config.security.auth.secret,
    salt: "authjs.session-token",
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("authjs.session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false, // dev/test only
  });

  return response;
}
