import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { consumeToken } from "@/lib/utils/verificationToken";

export const GET = async (request: NextRequest) => {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: StatusCodes.BAD_REQUEST });
  }

  const email = await consumeToken(token, "verify");
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=InvalidToken", config.host));
  }

  await prisma.user.updateMany({
    where: { email, emailVerified: null },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(new URL("/login?verified=true", config.host));
};
