"use server";

import { config } from "@/config";
import { renderVerifyEmailEmail } from "@/emails/renderEmails";
import { sendEmail } from "@/lib/mailer";
import { userRepo } from "@/lib/repo";
import { audit, getRequestContext } from "@/lib/utils/audit";
import { AuditAction } from "@/prisma/enums";
import { SignupWithPassword } from "@/useCases/users/SignupWithPassword";
import { type ServerActionResponse } from "@/utils/next";

export async function signupAction(data: {
  email: string;
  name: string;
  password: string;
}): Promise<ServerActionResponse> {
  const reqCtx = await getRequestContext();

  try {
    const useCase = new SignupWithPassword(userRepo);
    const result = await useCase.execute(data);

    // Send verification email
    const verifyUrl = `${config.host}/api/verify-email?token=${result.verificationTokenRaw}`;
    const html = await renderVerifyEmailEmail({
      baseUrl: config.host,
      url: verifyUrl,
      translations: {
        title: "Vérifiez votre adresse email",
        body: "Cliquez sur le bouton ci-dessous pour activer votre compte Roadmaps Faciles.",
        button: "Vérifier mon email",
        expiry: "Ce lien expire dans 24 heures.",
        ignore: "Si vous n'avez pas créé de compte, ignorez cet email.",
        footer: `© ${new Date().getFullYear()} Roadmaps Faciles`,
      },
    });

    await sendEmail({
      to: data.email,
      subject: "Vérifiez votre adresse email — Roadmaps Faciles",
      html,
      text: "Vérifiez votre adresse email en cliquant sur ce lien : " + verifyUrl,
    });

    audit(
      {
        action: AuditAction.USER_SIGNUP,
        userId: result.userId,
        targetType: "User",
        targetId: result.userId,
        metadata: { method: "password", email: data.email },
      },
      reqCtx,
    );

    return { ok: true };
  } catch (error) {
    const message = (error as Error).message;
    return { ok: false, error: message === "EMAIL_ALREADY_EXISTS" ? "EMAIL_ALREADY_EXISTS" : message };
  }
}
