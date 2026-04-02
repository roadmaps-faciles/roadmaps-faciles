import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const { identifier, isUsername } = (await req.json()) as { identifier: string; isUsername?: boolean };

  if (!identifier) {
    return NextResponse.json({ error: "Identifier required" }, { status: StatusCodes.BAD_REQUEST });
  }

  const user = await prisma.user.findFirst({
    where: isUsername ? { username: identifier } : { email: identifier },
    select: { otpSecret: true, otpVerifiedAt: true },
  });

  // If user not found or OTP not configured, return false (don't reveal user existence beyond what magic link already does)
  if (!user?.otpSecret || !user.otpVerifiedAt) {
    return NextResponse.json({ requiresOtp: false });
  }

  return NextResponse.json({ requiresOtp: true });
}
