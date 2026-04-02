"use server";

import { config } from "@/config";
import { renderVerifyEmailEmail } from "@/emails/renderEmails";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/mailer";
import { userOnTenantRepo, userRepo } from "@/lib/repo";
import { audit, getRequestContext } from "@/lib/utils/audit";
import { getDomainFromHost, getTenantFromDomain } from "@/lib/utils/tenant";
import { AuditAction } from "@/prisma/enums";
import { SignupWithPassword } from "@/useCases/users/SignupWithPassword";
import { type ServerActionResponse } from "@/utils/next";

export async function tenantSignupAction(data: {
  email: string;
  name: string;
  password: string;
}): Promise<ServerActionResponse> {
  const reqCtx = await getRequestContext();

  try {
    // Resolve tenant from domain
    const domain = await getDomainFromHost();
    const tenant = await getTenantFromDomain(domain);

    // Fetch settings separately (getTenantFromDomain returns Tenant without settings)
    const settings = await prisma.tenantSettings.findUnique({ where: { tenantId: tenant.id } });
    if (!settings) return { ok: false, error: "Tenant not configured" };
    if (settings.emailRegistrationPolicy === "NOONE") {
      return { ok: false, error: "REGISTRATION_DISABLED" };
    }
    if (settings.emailRegistrationPolicy === "DOMAINS") {
      const emailDomain = data.email.split("@")[1];
      if (!settings.allowedEmailDomains.includes(emailDomain)) {
        return { ok: false, error: "EMAIL_DOMAIN_NOT_ALLOWED" };
      }
    }

    // Check if user already exists
    const existingUser = await userRepo.findByEmail(data.email);

    let userId: string;

    if (existingUser) {
      // User exists (e.g. from root signup) — check if already member of this tenant
      const membership = await userOnTenantRepo.findMembership(existingUser.id, tenant.id);
      if (membership) {
        return { ok: false, error: "ALREADY_MEMBER" };
      }
      userId = existingUser.id;
    } else {
      // Create new user via signup use case
      const useCase = new SignupWithPassword(userRepo);
      const result = await useCase.execute(data);
      userId = result.userId;

      // Send verification email
      const verifyUrl = `${config.host}/api/verify-email?token=${result.verificationTokenRaw}`;
      const html = await renderVerifyEmailEmail({
        baseUrl: config.host,
        url: verifyUrl,
        translations: {
          title: "Vérifiez votre adresse email",
          body: "Cliquez sur le bouton ci-dessous pour activer votre compte.",
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
        text: "Vérifiez votre adresse email : " + verifyUrl,
      });
    }

    // Create tenant membership
    await userOnTenantRepo.create({
      userId,
      tenantId: tenant.id,
      role: "INHERITED",
      status: "ACTIVE",
    });

    audit(
      {
        action: AuditAction.USER_SIGNUP,
        userId,
        tenantId: tenant.id,
        targetType: "User",
        targetId: userId,
        metadata: { method: "password", email: data.email, tenantSignup: true },
      },
      reqCtx,
    );

    return { ok: true };
  } catch (error) {
    const message = (error as Error).message;
    return { ok: false, error: message === "EMAIL_ALREADY_EXISTS" ? "ALREADY_MEMBER" : message };
  }
}
