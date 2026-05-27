"use server";

import { config } from "@/config";
import { renderResetPasswordEmail } from "@/emails/renderEmails";
import { sendEmail } from "@/lib/mailer";
import { userRepo } from "@/lib/repo";
import { audit, getRequestContext } from "@/lib/utils/audit";
import { createPasswordResetToken } from "@/lib/utils/verificationToken";
import { AuditAction } from "@/prisma/enums";
import { type ServerActionResponse } from "@/utils/next";

export async function forgotPasswordAction(email: string): Promise<ServerActionResponse> {
  const reqCtx = await getRequestContext();

  // Always return success to prevent email enumeration
  const user = await userRepo.findByEmail(email.trim());

  if (user && user.passwordHash) {
    const { raw } = await createPasswordResetToken(email.trim());
    const resetUrl = `${config.host}/reset-password?token=${raw}`;

    const html = await renderResetPasswordEmail({
      baseUrl: config.host,
      url: resetUrl,
      translations: {
        title: "Réinitialiser votre mot de passe",
        body: "Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.",
        button: "Réinitialiser mon mot de passe",
        expiry: "Ce lien expire dans 1 heure.",
        ignore: "Si vous n'avez pas demandé de réinitialisation, ignorez cet email.",
        footer: `© ${new Date().getFullYear()} Roadmaps Faciles`,
      },
    });

    await sendEmail({
      to: email.trim(),
      subject: "Réinitialiser votre mot de passe - Roadmaps Faciles",
      html,
      text: "Réinitialisez votre mot de passe : " + resetUrl,
    });

    audit(
      {
        action: AuditAction.PASSWORD_RESET_REQUEST,
        userId: user.id,
        targetType: "User",
        targetId: user.id,
      },
      reqCtx,
    );
  }

  return { ok: true };
}
