import { type RegistrationResponseJSON, verifyRegistrationResponse } from "@simplewebauthn/server";
import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";

import { config } from "@/config";
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
  const rpID = config.rootDomain.replace(/:\d+$/, "");
  const origin = config.host;
  const reqCtx = await getRequestContext();

  const body = (await req.json()) as RegistrationResponseJSON;

  const expectedChallenge = await redis.getItem<string>(`webauthn:challenge:${userId}`);
  if (!expectedChallenge) {
    return NextResponse.json({ error: "Challenge expired" }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Verification failed" }, { status: StatusCodes.BAD_REQUEST });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    await prisma.authenticator.create({
      data: {
        credentialID: credential.id,
        userId,
        providerAccountId: userId,
        credentialPublicKey: Buffer.from(credential.publicKey).toString("base64url"),
        counter: credential.counter,
        credentialDeviceType,
        credentialBackedUp,
        transports: body.response.transports?.join(",") ?? null,
      },
    });

    // Update user's twoFactorEnabled flag and clear grace period deadline
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true, twoFactorDeadline: null },
    });

    // Clean up challenge
    await redis.removeItem(`webauthn:challenge:${userId}`);

    audit(
      {
        action: AuditAction.TWO_FACTOR_PASSKEY_REGISTER,
        userId,
        targetType: "Authenticator",
        targetId: credential.id,
      },
      reqCtx,
    );
    return NextResponse.json({ verified: true });
  } catch (error) {
    audit(
      {
        action: AuditAction.TWO_FACTOR_PASSKEY_REGISTER,
        success: false,
        error: (error as Error).message,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return NextResponse.json({ error: "Verification failed" }, { status: StatusCodes.BAD_REQUEST });
  }
}
