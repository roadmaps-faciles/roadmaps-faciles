import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { config } from "@/config";
import { redis } from "@/lib/db/redis/storage";
import { auth } from "@/lib/next-auth/auth";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: StatusCodes.UNAUTHORIZED });
  }

  const userId = session.user.uuid;
  const email = session.user.email;
  const code = generateCode();

  // Store code in Redis with 5 min TTL
  await redis.setItem(`2fa:email:${userId}`, code, { ttl: 300 });

  const transporter = nodemailer.createTransport({
    host: config.mailer.host,
    port: config.mailer.smtp.port,
    secure: config.mailer.smtp.ssl,
    auth:
      config.mailer.smtp.login && config.mailer.smtp.password
        ? {
            user: config.mailer.smtp.login,
            pass: config.mailer.smtp.password,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: config.mailer.from,
    to: email,
    subject: "Code de vérification 2FA",
    html: `<p>Votre code de vérification : <strong>${code}</strong></p><p>Ce code expire dans 5 minutes.</p>`,
    text: `Votre code de vérification : ${code}\nCe code expire dans 5 minutes.`,
  });

  return NextResponse.json({ sent: true });
}
