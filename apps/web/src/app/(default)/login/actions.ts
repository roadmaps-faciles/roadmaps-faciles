"use server";

import { ESPACE_MEMBRE_PROVIDER_ID } from "@incubateur-ademe/next-auth-espace-membre-provider";
import { EspaceMembreClientMemberNotFoundError } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";
import { AuthError } from "next-auth";
import { redirect, unstable_rethrow as rethrow } from "next/navigation";
import { verifySync } from "otplib";

import { prisma } from "@/lib/db/prisma";
import { redis } from "@/lib/db/redis/storage";
import { authDebug, dbgRedact, dbgStr } from "@/lib/debug/authDebug";
import { signIn } from "@/lib/next-auth/auth";
import { isRedirectError, type NextError } from "@/utils/next";

import { isSafeRelativeCallbackUrl } from "./loginHrefs";

export async function preLoginCheckAction(identifier: string, isUsername: boolean): Promise<{ requiresOtp: boolean }> {
  if (!identifier) return { requiresOtp: false };

  const user = await prisma.user.findFirst({
    where: isUsername ? { username: identifier } : { email: identifier },
    select: { otpSecret: true, otpVerifiedAt: true },
  });

  if (!user?.otpSecret || !user.otpVerifiedAt) {
    return { requiresOtp: false };
  }

  return { requiresOtp: true };
}

export async function preLoginVerifyAction(
  identifier: string,
  code: string,
  isUsername: boolean,
): Promise<{ error?: string; verified: boolean }> {
  if (!identifier || !code) return { verified: false, error: "Identifier and code required" };

  const user = await prisma.user.findFirst({
    where: isUsername ? { username: identifier } : { email: identifier },
    select: { id: true, otpSecret: true, otpVerifiedAt: true },
  });

  if (!user?.otpSecret || !user.otpVerifiedAt) {
    return { verified: false, error: "OTP not configured" };
  }

  const result = verifySync({ token: code, secret: user.otpSecret });
  if (!result.valid) {
    return { verified: false, error: "Invalid code" };
  }

  await redis.setItem(`otp:pre-login:${user.id}`, "1", { ttl: 300 });
  return { verified: true };
}

/**
 * `callbackUrl` doit être une URL relative same-host (ex: `/api/auth-bridge?...`).
 * NextAuth la valide à nouveau dans le redirect callback ; les URLs externes ou
 * mal formées fallback sur "/".
 */
export async function loginAction(identifier: string, loginWithEmail: boolean, callbackUrl?: string): Promise<void> {
  authDebug("loginAction.start", { identifier: dbgStr(identifier), loginWithEmail });
  try {
    await signIn(loginWithEmail ? "nodemailer" : ESPACE_MEMBRE_PROVIDER_ID, {
      email: identifier,
      redirectTo: isSafeRelativeCallbackUrl(callbackUrl) ? callbackUrl : "/",
    });
  } catch (error) {
    if (isRedirectError(error as NextError)) rethrow(error);
    if (error instanceof AuthError) {
      const causeErr = (error as { cause?: { err?: unknown } } & AuthError).cause?.err;
      authDebug("loginAction.authError", {
        type: error.type,
        name: error.name,
        message: dbgRedact(error.message),
        causeName: causeErr instanceof Error ? causeErr.name : typeof causeErr,
        causeMessage: causeErr instanceof Error ? dbgRedact(causeErr.message) : String(causeErr),
        isMemberNotFound: causeErr instanceof EspaceMembreClientMemberNotFoundError,
      });
      if (error.cause?.err instanceof EspaceMembreClientMemberNotFoundError)
        redirect("/login/error?error=AccessDenied");
      redirect(`/login/error?error=${error.type}`);
    }
    authDebug("loginAction.nonAuthError", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? dbgRedact(error.message) : String(error),
    });
    redirect("/error");
  }
}
