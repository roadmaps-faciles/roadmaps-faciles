"use server";

import { prisma } from "@/lib/db/prisma";
import { audit, getRequestContext } from "@/lib/utils/audit";
import { hashPassword } from "@/lib/utils/password";
import { consumeToken } from "@/lib/utils/verificationToken";
import { AuditAction } from "@/prisma/enums";
import { type ServerActionResponse } from "@/utils/next";

export async function resetPasswordAction(token: string, password: string): Promise<ServerActionResponse> {
  const reqCtx = await getRequestContext();

  const email = await consumeToken(token, "reset");
  if (!email) {
    return { ok: false, error: "INVALID_OR_EXPIRED_TOKEN" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "USER_NOT_FOUND" };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, emailVerified: user.emailVerified ?? new Date() },
  });

  audit(
    {
      action: AuditAction.PASSWORD_RESET_COMPLETE,
      userId: user.id,
      targetType: "User",
      targetId: user.id,
    },
    reqCtx,
  );

  return { ok: true };
}
