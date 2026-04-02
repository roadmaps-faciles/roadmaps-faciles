"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/next-auth/auth";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { type ServerActionResponse } from "@/utils/next";

export const toggleEmailTwoFactor = async (): Promise<ServerActionResponse> => {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized" };
  }

  const userId = session.user.uuid;
  const reqCtx = await getRequestContext();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailTwoFactorEnabled: true, otpVerifiedAt: true },
  });

  if (!user) {
    return { ok: false, error: "User not found" };
  }

  const newValue = !user.emailTwoFactorEnabled;

  // Check if at least one 2FA method remains active after toggling
  const hasOtp = !!user.otpVerifiedAt;
  const authenticators = await prisma.authenticator.count({ where: { userId } });
  const hasPasskey = authenticators > 0;
  const willHaveAny2FA = newValue || hasOtp || hasPasskey;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailTwoFactorEnabled: newValue,
        twoFactorEnabled: willHaveAny2FA,
        ...(willHaveAny2FA ? { twoFactorDeadline: null } : {}),
      },
    });

    audit(
      {
        action: AuditAction.TWO_FACTOR_EMAIL_TOGGLE,
        userId,
        targetType: "User",
        targetId: userId,
        metadata: { enabled: newValue },
      },
      reqCtx,
    );
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.TWO_FACTOR_EMAIL_TOGGLE,
        success: false,
        error: (error as Error).message,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const removeOtp = async (): Promise<ServerActionResponse> => {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized" };
  }

  const userId = session.user.uuid;
  const reqCtx = await getRequestContext();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailTwoFactorEnabled: true },
  });

  if (!user) {
    return { ok: false, error: "User not found" };
  }

  const authenticators = await prisma.authenticator.count({ where: { userId } });
  const hasPasskey = authenticators > 0;
  const willHaveAny2FA = user.emailTwoFactorEnabled || hasPasskey;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        otpSecret: null,
        otpVerifiedAt: null,
        twoFactorEnabled: willHaveAny2FA,
        ...(willHaveAny2FA ? { twoFactorDeadline: null } : {}),
      },
    });

    audit(
      {
        action: AuditAction.TWO_FACTOR_OTP_REMOVE,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.TWO_FACTOR_OTP_REMOVE,
        success: false,
        error: (error as Error).message,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const removePasskey = async (credentialId: string): Promise<ServerActionResponse> => {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Unauthorized" };
  }

  const userId = session.user.uuid;
  const reqCtx = await getRequestContext();

  const authenticator = await prisma.authenticator.findUnique({
    where: { credentialID: credentialId },
  });

  if (!authenticator || authenticator.userId !== userId) {
    return { ok: false, error: "Authenticator not found" };
  }

  try {
    await prisma.authenticator.delete({
      where: { credentialID: credentialId },
    });

    // Check remaining 2FA methods
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailTwoFactorEnabled: true, otpVerifiedAt: true },
    });
    const remainingAuthenticators = await prisma.authenticator.count({ where: { userId } });
    const willHaveAny2FA = !!user?.emailTwoFactorEnabled || !!user?.otpVerifiedAt || remainingAuthenticators > 0;

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: willHaveAny2FA,
        ...(willHaveAny2FA ? { twoFactorDeadline: null } : {}),
      },
    });

    audit(
      {
        action: AuditAction.TWO_FACTOR_PASSKEY_REMOVE,
        userId,
        targetType: "Authenticator",
        targetId: credentialId,
      },
      reqCtx,
    );
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.TWO_FACTOR_PASSKEY_REMOVE,
        success: false,
        error: (error as Error).message,
        userId,
        targetType: "Authenticator",
        targetId: credentialId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
