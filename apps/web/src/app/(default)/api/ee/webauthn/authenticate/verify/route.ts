import { type AuthenticationResponseJSON, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis/storage";
import { auth } from "@/lib/next-auth/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const userId = session.user.uuid;
  const rpID = config.rootDomain.replace(/:\d+$/, "");
  const origin = config.host;

  const body = (await req.json()) as AuthenticationResponseJSON;

  const expectedChallenge = await redis.getItem<string>(`webauthn:auth-challenge:${userId}`);
  if (!expectedChallenge) {
    return NextResponse.json({ error: "Challenge expired" }, { status: StatusCodes.BAD_REQUEST });
  }

  const authenticator = await prisma.authenticator.findUnique({
    where: { credentialID: body.id },
  });

  if (!authenticator || authenticator.userId !== userId) {
    return NextResponse.json({ error: "Authenticator not found" }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: authenticator.credentialID,
        publicKey: Buffer.from(authenticator.credentialPublicKey, "base64url"),
        counter: authenticator.counter,
        transports: authenticator.transports?.split(",") as AuthenticatorTransport[] | undefined,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Verification failed" }, { status: StatusCodes.BAD_REQUEST });
    }

    // Update counter
    await prisma.authenticator.update({
      where: { credentialID: authenticator.credentialID },
      data: { counter: verification.authenticationInfo.newCounter },
    });

    // Clean up challenge and store server-side 2FA proof
    await redis.removeItem(`webauthn:auth-challenge:${userId}`);
    await redis.setItem(`2fa:proof:${userId}`, "1", { ttl: 60 });

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: StatusCodes.BAD_REQUEST });
  }
}
