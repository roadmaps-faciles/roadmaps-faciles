import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import { toDataURL } from "qrcode";

import { config } from "@/config";
import { redis } from "@/lib/db/redis/storage";
import { auth } from "@/lib/next-auth/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const userId = session.user.uuid;
  const secret = generateSecret();

  // Store temporary secret in Redis (not in DB yet — wait for verification)
  await redis.setItem(`otp:setup:${userId}`, secret, { ttl: 600 }); // 10 minutes

  const otpAuthUrl = generateURI({ secret, issuer: config.brand.name, label: session.user.email });
  const qrCodeDataUrl = await toDataURL(otpAuthUrl);

  return NextResponse.json({
    secret,
    qrCode: qrCodeDataUrl,
  });
}
