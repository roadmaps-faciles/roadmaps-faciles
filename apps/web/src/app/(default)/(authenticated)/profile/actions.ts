"use server";

import { EspaceMembreClientMemberNotFoundError } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";
import { getLocale, getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto from "node:crypto";

import { config } from "@/config";
import { renderEmLinkConfirmEmail } from "@/emails/renderEmails";
import { prisma } from "@/lib/db/prisma";
import { createEmLinkToken, espaceMembreClient, getEmUserEmail } from "@/lib/gouv/espaceMembre";
import { sendEmail } from "@/lib/mailer";
import { userRepo } from "@/lib/repo";
import { PrismaClientKnownRequestError } from "@/prisma/internal/prismaNamespace";
import { UpdateUser } from "@/useCases/users/UpdateUser";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertSession } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

const isUniqueConstraintError = (error: unknown): boolean =>
  error instanceof PrismaClientKnownRequestError && error.code === "P2002";

interface UpdateProfileData {
  email?: string;
  name?: null | string;
  notificationsEnabled?: boolean;
}

export const updateProfile = async (data: UpdateProfileData): Promise<ServerActionResponse> => {
  const session = await assertSession();
  const t = await getTranslations("serverErrors");
  const reqCtx = await getRequestContext();

  try {
    const useCase = new UpdateUser(userRepo);
    await useCase.execute({ id: session.user.uuid, data });
    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        userId: session.user.uuid,
        targetType: "User",
        targetId: session.user.uuid,
        metadata: { fields: Object.keys(data) },
      },
      reqCtx,
    );
    revalidatePath("/profile");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "User",
        targetId: session.user.uuid,
      },
      reqCtx,
    );
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: t("emailAlreadyUsed") };
    }
    return { ok: false, error: (error as Error).message };
  }
};

interface RequestEmLinkData {
  emEmail: string;
}

export const requestEmLink = async (username: string): Promise<ServerActionResponse<RequestEmLinkData>> => {
  const session = await assertSession();
  const t = await getTranslations("serverErrors");
  const tEmail = await getTranslations("emails.emLinkConfirm");
  const reqCtx = await getRequestContext();

  try {
    // Vérifier si ce username EM est déjà lié à un autre utilisateur
    const existingUser = await userRepo.findByUsername(username);
    if (existingUser && existingUser.id !== session.user.uuid) {
      audit(
        {
          action: AuditAction.EM_LINK_REQUEST,
          success: false,
          error: "emLoginAlreadyLinked",
          userId: session.user.uuid,
          metadata: { username },
        },
        reqCtx,
      );
      return { ok: false, error: t("emLoginAlreadyLinked") };
    }

    const member = await espaceMembreClient.member.getByUsername(username);

    if (!member.isActive) {
      audit(
        {
          action: AuditAction.EM_LINK_REQUEST,
          success: false,
          error: "emMemberNotActive",
          userId: session.user.uuid,
          metadata: { username },
        },
        reqCtx,
      );
      return { ok: false, error: t("emMemberNotActive") };
    }

    const emEmail = getEmUserEmail(member);

    const headersList = await headers();
    const proto = headersList.get("x-forwarded-proto") || "http";
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
    const redirectUrl = `${proto}://${host}/profile`;

    const token = createEmLinkToken(session.user.uuid, username, redirectUrl);
    const confirmUrl = `${config.host}/api/confirm-em-link?token=${token}`;

    const locale = await getLocale();
    const tFooter = await getTranslations("emails");

    const html = await renderEmLinkConfirmEmail({
      baseUrl: config.host,
      confirmUrl,
      locale,
      translations: {
        title: tEmail("subject"),
        greeting: tEmail("greeting"),
        body: tEmail("body", { username }),
        button: tEmail("button"),
        expiry: tEmail("expiry"),
        closing: tEmail("closing"),
        footer: tFooter("footer"),
      },
    });

    await sendEmail({
      to: emEmail,
      subject: tEmail("subject"),
      html,
      text: `${tEmail("greeting")}\n\n${tEmail("body", { username })}\n\n${confirmUrl}\n\n${tEmail("expiry")}\n\n${tEmail("closing")}`,
    });

    // Mask email: show first 3 chars + domain
    const [localPart, domain] = emEmail.split("@");
    const maskedEmail = `${localPart.slice(0, 3)}***@${domain}`;

    audit(
      {
        action: AuditAction.EM_LINK_REQUEST,
        userId: session.user.uuid,
        metadata: { username },
      },
      reqCtx,
    );
    return { ok: true, data: { emEmail: maskedEmail } };
  } catch (error) {
    audit(
      {
        action: AuditAction.EM_LINK_REQUEST,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        metadata: { username },
      },
      reqCtx,
    );
    if (error instanceof EspaceMembreClientMemberNotFoundError) {
      return { ok: false, error: t("emMemberNotFound") };
    }
    return { ok: false, error: (error as Error).message };
  }
};

export const unlinkEspaceMembre = async (): Promise<ServerActionResponse> => {
  const session = await assertSession();
  const reqCtx = await getRequestContext();

  try {
    const useCase = new UpdateUser(userRepo);
    await useCase.execute({
      id: session.user.uuid,
      data: {
        isBetaGouvMember: false,
        username: null,
        image: null,
      },
    });
    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        userId: session.user.uuid,
        targetType: "User",
        targetId: session.user.uuid,
        metadata: { operation: "unlinkEspaceMembre" },
      },
      reqCtx,
    );
    revalidatePath("/profile");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "User",
        targetId: session.user.uuid,
        metadata: { operation: "unlinkEspaceMembre" },
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const switchToEmEmail = async (): Promise<ServerActionResponse> => {
  const session = await assertSession();
  const t = await getTranslations("serverErrors");
  const reqCtx = await getRequestContext();

  try {
    if (!session.user.isBetaGouvMember) {
      return { ok: false, error: t("accountNotLinkedToEm") };
    }

    const user = await userRepo.findById(session.user.uuid);
    if (!user?.username) {
      return { ok: false, error: t("noEmUsername") };
    }

    const member = await espaceMembreClient.member.getByUsername(user.username);
    const emEmail = getEmUserEmail(member);

    if (emEmail === user.email) {
      return { ok: false, error: t("emailAlreadySameAsEm") };
    }

    // Vérifier si l'email EM est déjà utilisé par un autre compte
    const existingUser = await userRepo.findByEmail(emEmail);
    if (existingUser && existingUser.id !== session.user.uuid) {
      return { ok: false, error: t("emailAlreadyUsed") };
    }

    const useCase = new UpdateUser(userRepo);
    await useCase.execute({
      id: session.user.uuid,
      data: { email: emEmail },
    });

    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        userId: session.user.uuid,
        targetType: "User",
        targetId: session.user.uuid,
        metadata: { operation: "switchToEmEmail" },
      },
      reqCtx,
    );
    revalidatePath("/profile");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        targetType: "User",
        targetId: session.user.uuid,
        metadata: { operation: "switchToEmEmail" },
      },
      reqCtx,
    );
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: t("emailAlreadyUsed") };
    }
    return { ok: false, error: (error as Error).message };
  }
};

export const deleteAccount = async (): Promise<ServerActionResponse> => {
  const session = await assertSession();
  const userId = session.user.uuid;
  const t = await getTranslations("serverErrors");
  const reqCtx = await getRequestContext();

  try {
    const anonymousEmail = `deleted-${crypto.randomUUID()}@anonymous.local`;

    // Transaction interactive pour vérifier atomiquement le last-owner + supprimer
    await prisma.$transaction(async tx => {
      const ownerships = await tx.userOnTenant.findMany({
        where: { userId, role: "OWNER" },
        select: { tenantId: true },
      });
      for (const { tenantId } of ownerships) {
        const ownerCount = await tx.userOnTenant.count({
          where: { tenantId, role: "OWNER", status: "ACTIVE" },
        });
        if (ownerCount <= 1) {
          throw new Error(t("lastOwnerCannotDelete"));
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          email: anonymousEmail,
          name: null,
          username: null,
          image: null,
          isBetaGouvMember: false,
          status: "DELETED",
          notificationsEnabled: false,
        },
      });
      await tx.userOnTenant.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.apiKey.deleteMany({ where: { userId } });
      await tx.follow.deleteMany({ where: { userId } });
    });

    audit(
      {
        action: AuditAction.ACCOUNT_DELETE,
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
        action: AuditAction.ACCOUNT_DELETE,
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
