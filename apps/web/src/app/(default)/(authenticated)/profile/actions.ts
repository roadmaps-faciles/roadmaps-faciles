"use server";

import { EspaceMembreClientMemberNotFoundError } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";
import { getLocale, getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import crypto, { randomUUID } from "node:crypto";

import { config } from "@/config";
import { renderEmLinkConfirmEmail } from "@/emails/renderEmails";
import { prisma } from "@/lib/db/prisma";
import { getStorageProvider } from "@/lib/ee/storage-provider";
import { ALLOWED_IMAGE_TYPES, imageExtensionForType, storagePaths } from "@/lib/ee/storage-provider/validation";
import { createEmLinkToken, espaceMembreClient, getEmUserEmail } from "@/lib/gouv/espaceMembre";
import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/mailer";
import { userRepo } from "@/lib/repo";
import { PrismaClientKnownRequestError } from "@/prisma/internal/prismaNamespace";
import { UpdateUser } from "@/useCases/users/UpdateUser";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertSession } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost } from "@/utils/tenant";

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

  // Sur le root, l'email d'un compte EM est géré par l'Espace Membre : on strippe
  // le champ côté serveur (un appel forgé pourrait sinon écraser l'email ; l'UI le
  // bloque déjà). Le changement légitime passe par switchToEmEmail. Sur tenant,
  // l'édition reste autorisée (cf. ProfileForm).
  const sanitized: UpdateProfileData = { ...data };
  if (sanitized.email !== undefined && session.user.isBetaGouvMember) {
    const domain = await getDomainFromHost();
    if (domain === config.rootDomain) {
      delete sanitized.email;
    }
  }

  try {
    const useCase = new UpdateUser(userRepo);
    await useCase.execute({ id: session.user.uuid, data: sanitized });
    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        userId: session.user.uuid,
        targetType: "User",
        targetId: session.user.uuid,
        metadata: { fields: Object.keys(sanitized) },
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

// --- Avatar upload --------------------------------------------------------
//
// Pas d'`assertEntitlement` ici (contrairement à upload-image.ts) : l'avatar est
// un asset account-level (lié au user), pas tenant-level. Côté storage, la quota
// est portée par l'instance globale, pas par tenant.

/**
 * `image` est stocké en `/api/uploads/<key>` quand le user uploade chez nous,
 * ou en URL absolue externe (avatar EM, OAuth provider). On ne supprime que les
 * uploads internes (préfixés par `/api/uploads/avatars/<userId>/`).
 */
export const extractOwnedAvatarKey = (imageUrl: null | string | undefined, userId: string): null | string => {
  if (!imageUrl) return null;
  const prefix = `/api/uploads/avatars/${userId}/`;
  return imageUrl.startsWith(prefix) ? imageUrl.replace(/^\/api\/uploads\//, "") : null;
};

export const uploadAvatar = async (formData: FormData): Promise<ServerActionResponse<{ url: string }>> => {
  const session = await assertSession();
  const t = await getTranslations("serverErrors");
  const reqCtx = await getRequestContext();
  const userId = session.user.uuid;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        success: false,
        error: "Invalid file",
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("uploadInvalidFile") };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        success: false,
        error: `Invalid type: ${file.type}`,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("uploadInvalidType") };
  }

  const maxBytes = config.storageProvider.maxFileSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        success: false,
        error: `Too large: ${file.size} bytes`,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("uploadTooLarge", { max: config.storageProvider.maxFileSizeMb }) };
  }

  const ext = imageExtensionForType(file.type);
  const key = storagePaths.avatar(userId, randomUUID(), ext);
  const newUrl = `/api/uploads/${key}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    await storage.upload(key, buffer, file.type);

    const previousUser = await userRepo.findById(userId);
    const previousKey = extractOwnedAvatarKey(previousUser?.image, userId);

    await new UpdateUser(userRepo).execute({ id: userId, data: { image: newUrl } });

    if (previousKey) {
      try {
        await storage.delete(previousKey);
      } catch (err) {
        // Suppression best-effort : on log mais on n'échoue pas l'upload.
        logger.warn({ err, previousKey }, "Failed to delete previous avatar");
      }
    }

    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        userId,
        targetType: "User",
        targetId: userId,
        metadata: { key, contentType: file.type, size: file.size, kind: "avatar" },
      },
      reqCtx,
    );
    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        userId,
        targetType: "User",
        targetId: userId,
        metadata: { fields: ["image"] },
      },
      reqCtx,
    );

    revalidatePath("/profile");
    return { ok: true, data: { url: newUrl } };
  } catch (error) {
    logger.error({ err: error, userId }, "Error uploading avatar");
    audit(
      {
        action: AuditAction.IMAGE_UPLOAD,
        success: false,
        error: (error as Error).message,
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return { ok: false, error: t("uploadFailed") };
  }
};

export const removeAvatar = async (): Promise<ServerActionResponse> => {
  const session = await assertSession();
  const reqCtx = await getRequestContext();
  const userId = session.user.uuid;

  try {
    const user = await userRepo.findById(userId);
    const previousKey = extractOwnedAvatarKey(user?.image, userId);

    await new UpdateUser(userRepo).execute({ id: userId, data: { image: null } });

    if (previousKey) {
      try {
        await getStorageProvider().delete(previousKey);
      } catch (err) {
        logger.warn({ err, previousKey }, "Failed to delete avatar from storage");
      }
    }

    audit(
      {
        action: AuditAction.PROFILE_UPDATE,
        userId,
        targetType: "User",
        targetId: userId,
        metadata: { fields: ["image"], operation: "removeAvatar" },
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
        userId,
        targetType: "User",
        targetId: userId,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
