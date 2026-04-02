import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis/storage";
import { auth } from "@/lib/next-auth/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const userId = session.user.uuid;
  const rpID = config.rootDomain.replace(/:\d+$/, "");

  const authenticators = await prisma.authenticator.findMany({
    where: { userId },
  });

  if (authenticators.length === 0) {
    return NextResponse.json({ error: "No passkeys registered" }, { status: StatusCodes.BAD_REQUEST });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: authenticators.map(auth => ({
      id: auth.credentialID,
      transports: auth.transports?.split(",") as AuthenticatorTransport[] | undefined,
    })),
    userVerification: "preferred",
  });

  // Store challenge in Redis with 5 min TTL
  await redis.setItem(`webauthn:auth-challenge:${userId}`, options.challenge, { ttl: 300 });

  return NextResponse.json(options);
}
