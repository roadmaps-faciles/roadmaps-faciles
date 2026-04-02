import crypto from "node:crypto";
import { z } from "zod";

import { config } from "@/config";
import { getEmailTranslations, interpolate } from "@/emails/getEmailTranslations";
import { renderInvitationEmail } from "@/emails/renderEmails";
import { sendEmail } from "@/lib/mailer";
import { type IInvitationRepo } from "@/lib/repo/IInvitationRepo";
import { type IUserOnTenantRepo } from "@/lib/repo/IUserOnTenantRepo";
import { type IUserRepo } from "@/lib/repo/IUserRepo";
import { type Invitation } from "@/prisma/client";
import { type Locale } from "@/utils/i18n";

import { type UseCase } from "../types";

const invitationRoleEnum = z.enum(["USER", "MODERATOR", "ADMIN", "OWNER"]);
export type InvitationRole = z.infer<typeof invitationRoleEnum>;

export const SendInvitationInput = z.object({
  tenantId: z.number(),
  email: z.string().email(),
  tenantUrl: z.string().url(),
  role: invitationRoleEnum.optional().default("USER"),
});

// eslint-disable-next-line import/namespace -- false positive: z.infer exists in Zod 4
export interface SendInvitationExecuteInput extends z.infer<typeof SendInvitationInput> {
  locale?: Locale;
}
export type SendInvitationOutput = Invitation;

export class SendInvitation implements UseCase<SendInvitationExecuteInput, SendInvitationOutput> {
  constructor(
    private readonly invitationRepo: IInvitationRepo,
    private readonly userRepo: IUserRepo,
    private readonly userOnTenantRepo: IUserOnTenantRepo,
  ) {}

  public async execute(input: SendInvitationExecuteInput): Promise<SendInvitationOutput> {
    // Check if user with this email already exists and is a member of this tenant
    const existingUser = await this.userRepo.findByEmail(input.email);

    if (existingUser) {
      if (existingUser.status === "BLOCKED" || existingUser.status === "DELETED") {
        throw new Error("Cet utilisateur est bloqué ou supprimé.");
      }

      const membership = await this.userOnTenantRepo.findMembership(existingUser.id, input.tenantId);
      if (membership) {
        if (membership.status === "BLOCKED") {
          throw new Error("Cet utilisateur est bloqué sur ce tenant.");
        }
        throw new Error("Cet utilisateur est déjà membre de ce tenant.");
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await this.invitationRepo.findByEmailAndTenant(input.email, input.tenantId);
    if (existingInvitation && !existingInvitation.acceptedAt) {
      throw new Error("Une invitation est déjà en attente pour cet utilisateur.");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenDigest = crypto.createHash("sha256").update(token).digest("hex");

    // If a previous invitation was accepted, delete it and create a new one
    if (existingInvitation) {
      await this.invitationRepo.delete(existingInvitation.id);
    }

    const invitation = await this.invitationRepo.create({
      tenantId: input.tenantId,
      email: input.email,
      tokenDigest,
      role: input.role,
    });

    const invitationLink = `${input.tenantUrl}/login?invitation=${token}`;

    const locale = input.locale ?? "fr";
    const isOwnerInvite = input.role === "OWNER";

    const [t, tFooter] = await Promise.all([
      getEmailTranslations(locale, "emails.invitation", [
        "subjectOwner",
        "subjectUser",
        "title",
        "body",
        "roleOwner",
        "button",
        "ignore",
      ]),
      getEmailTranslations(locale, "emails", ["footer"]),
    ]);

    const subject = isOwnerInvite ? t.subjectOwner : t.subjectUser;
    const roleText = isOwnerInvite ? t.roleOwner : "";
    const bodyText = interpolate(t.body, { roleText });

    const html = await renderInvitationEmail({
      baseUrl: config.host,
      invitationLink,
      locale,
      translations: {
        title: t.title,
        body: bodyText,
        button: t.button,
        ignore: t.ignore,
        footer: tFooter.footer,
      },
    });

    await sendEmail({
      to: input.email,
      subject,
      html,
      text: `${bodyText}\n\n${invitationLink}\n\n${t.ignore}`,
    });

    return invitation;
  }
}
