import "server-only";
import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/db/prisma";

export const VERIFY_EMAIL_EXPIRY_HOURS = 24;
export const RESET_PASSWORD_EXPIRY_HOURS = 1;

/**
 * Generate a cryptographically secure token with its SHA-256 digest.
 * The raw token is sent to the user (email link), the digest is stored in DB.
 */
export function generateToken(): { digest: string; raw: string } {
  const raw = randomBytes(32).toString("hex");
  const digest = createHash("sha256").update(raw).digest("hex");
  return { raw, digest };
}

/**
 * Create a verification token in the NextAuth VerificationToken table.
 * Uses the `identifier` field with a type prefix to distinguish purposes.
 *
 * Convention: `verify:{email}` for email verification, `reset:{email}` for password reset.
 */
export async function createEmailVerificationToken(email: string) {
  const { raw, digest } = generateToken();
  const expires = new Date(Date.now() + VERIFY_EMAIL_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: `verify:${email}`, token: digest, expires },
  });

  return { raw, expires };
}

export async function createPasswordResetToken(email: string) {
  const { raw, digest } = generateToken();
  const expires = new Date(Date.now() + RESET_PASSWORD_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  await prisma.verificationToken.create({
    data: { identifier: `reset:${email}`, token: digest, expires },
  });

  return { raw, expires };
}

/**
 * Consume a verification token. Returns the email if valid, null otherwise.
 * The token is deleted after successful consumption (one-time use).
 */
export async function consumeToken(rawToken: string, prefix: "reset" | "verify"): Promise<null | string> {
  const digest = createHash("sha256").update(rawToken).digest("hex");

  const record = await prisma.verificationToken.findFirst({
    where: {
      token: digest,
      identifier: { startsWith: `${prefix}:` },
      expires: { gt: new Date() },
    },
  });

  if (!record) return null;

  // Extract email from identifier
  const email = record.identifier.replace(`${prefix}:`, "");

  // Delete the consumed token
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token: record.token } },
  });

  return email;
}
