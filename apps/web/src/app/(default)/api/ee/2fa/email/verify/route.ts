import { StatusCodes } from "http-status-codes";
import { type NextRequest, NextResponse } from "next/server";

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

  const storedCode = await redis.getItem<string>(`2fa:email:${userId}`);
  if (!storedCode) {
    return NextResponse.json({ error: "Code expired" }, { status: StatusCodes.BAD_REQUEST });
  }

  if (storedCode !== code) {
    return NextResponse.json({ error: "Invalid code" }, { status: StatusCodes.BAD_REQUEST });
  }

  // Clean up code and store server-side 2FA proof
  await redis.removeItem(`2fa:email:${userId}`);
  await redis.setItem(`2fa:proof:${userId}`, "1", { ttl: 60 });

  return NextResponse.json({ verified: true });
}
