"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/next-auth/auth";
import { hashPassword, verifyPassword } from "@/lib/utils/password";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { type ServerActionResponse } from "@/utils/next";

export async function changePassword(currentPassword: string, newPassword: string): Promise<ServerActionResponse> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const reqCtx = await getRequestContext();
  const user = await prisma.user.findUnique({
    where: { id: session.user.uuid },
    select: { id: true, passwordHash: true },
  });

  if (!user?.passwordHash) return { ok: false, error: "No password set" };

  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) return { ok: false, error: "WRONG_PASSWORD" };

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  audit(
    {
      action: AuditAction.PASSWORD_CHANGE,
      userId: user.id,
      targetType: "User",
      targetId: user.id,
    },
    reqCtx,
  );

  return { ok: true };
}

export async function setPassword(newPassword: string): Promise<ServerActionResponse> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const reqCtx = await getRequestContext();
  const user = await prisma.user.findUnique({
    where: { id: session.user.uuid },
    select: { id: true, passwordHash: true },
  });

  if (!user) return { ok: false, error: "User not found" };
  if (user.passwordHash) return { ok: false, error: "Password already set — use change instead" };

  const hash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

  audit(
    {
      action: AuditAction.PASSWORD_SET,
      userId: user.id,
      targetType: "User",
      targetId: user.id,
    },
    reqCtx,
  );

  return { ok: true };
}
