import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";
import { verifySync } from "otplib";

import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis/storage";
import { auth } from "@/lib/next-auth/auth";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const userId = session.user.uuid;
  const reqCtx = await getRequestContext();
  const { code } = (await req.json()) as { code: string };

  if (!code) {
    audit({ action: AuditAction.TWO_FACTOR_OTP_SETUP, success: false, error: "codeRequired", userId }, reqCtx);
    return NextResponse.json({ error: "Code required" }, { status: StatusCodes.BAD_REQUEST });
  }

  const secret = await redis.getItem<string>(`otp:setup:${userId}`);
  if (!secret) {
    audit({ action: AuditAction.TWO_FACTOR_OTP_SETUP, success: false, error: "setupExpired", userId }, reqCtx);
    return NextResponse.json({ error: "Setup expired" }, { status: StatusCodes.BAD_REQUEST });
  }

  const result = verifySync({ token: code, secret });
  if (!result.valid) {
    audit({ action: AuditAction.TWO_FACTOR_OTP_SETUP, success: false, error: "invalidCode", userId }, reqCtx);
    return NextResponse.json({ error: "Invalid code" }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    // Store secret in DB, mark OTP as verified, and clear grace period deadline
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpSecret: secret,
        otpVerifiedAt: new Date(),
        twoFactorEnabled: true,
        twoFactorDeadline: null,
      },
    });

    // Clean up temporary secret
    await redis.removeItem(`otp:setup:${userId}`);

    audit(
      {
        action: AuditAction.TWO_FACTOR_OTP_SETUP,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return NextResponse.json({ verified: true });
  } catch (error) {
    audit(
      {
        action: AuditAction.TWO_FACTOR_OTP_SETUP,
        success: false,
        error: (error as Error).message,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return NextResponse.json({ error: "Setup failed" }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}
