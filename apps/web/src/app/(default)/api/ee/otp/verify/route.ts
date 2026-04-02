import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import { verifySync } from "otplib";

import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis/storage";
import { auth } from "@/lib/next-auth/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const userId = session.user.uuid;
  const { code } = (await req.json()) as { code: string };

  if (!code) {
    return NextResponse.json({ error: "Code required" }, { status: StatusCodes.BAD_REQUEST });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { otpSecret: true, otpVerifiedAt: true },
  });

  if (!user?.otpSecret || !user.otpVerifiedAt) {
    return NextResponse.json({ error: "OTP not configured" }, { status: StatusCodes.BAD_REQUEST });
  }

  const result = verifySync({ token: code, secret: user.otpSecret });
  if (!result.valid) {
    return NextResponse.json({ error: "Invalid code" }, { status: StatusCodes.BAD_REQUEST });
  }

  // Store server-side 2FA proof
  await redis.setItem(`2fa:proof:${userId}`, "1", { ttl: 60 });

  return NextResponse.json({ verified: true });
}
