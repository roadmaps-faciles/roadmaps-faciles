import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import { verifySync } from "otplib";

import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis/storage";

export async function POST(req: NextRequest) {
  const { identifier, code, isUsername } = (await req.json()) as {
    code: string;
    identifier: string;
    isUsername?: boolean;
  };

  if (!identifier || !code) {
    return NextResponse.json({ error: "Identifier and code required" }, { status: StatusCodes.BAD_REQUEST });
  }

  const user = await prisma.user.findFirst({
    where: isUsername ? { username: identifier } : { email: identifier },
    select: { id: true, otpSecret: true, otpVerifiedAt: true },
  });

  if (!user?.otpSecret || !user.otpVerifiedAt) {
    return NextResponse.json({ error: "OTP not configured" }, { status: StatusCodes.BAD_REQUEST });
  }

  const result = verifySync({ token: code, secret: user.otpSecret });
  if (!result.valid) {
    return NextResponse.json({ error: "Invalid code" }, { status: StatusCodes.BAD_REQUEST });
  }

  // Store pre-login OTP proof with longer TTL (5 minutes - user still needs to click magic link)
  await redis.setItem(`otp:pre-login:${user.id}`, "1", { ttl: 300 });

  return NextResponse.json({ verified: true });
}
