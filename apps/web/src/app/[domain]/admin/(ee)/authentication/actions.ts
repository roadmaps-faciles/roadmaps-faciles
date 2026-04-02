"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { assertEntitlement } from "@/lib/ee/entitlements";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { tenantDefaultOAuthRepo, tenantSettingsRepo } from "@/lib/repo";
import { type EmailRegistrationPolicy } from "@/prisma/enums";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertTenantAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const saveAuthenticationSettings = async (data: {
  allowedEmailDomains: string[];
  emailRegistrationPolicy: EmailRegistrationPolicy;
}): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.SSO_ENTERPRISE);
  const reqCtx = await getRequestContext();

  try {
    const settings = await tenantSettingsRepo.findByTenantId(tenant.id);
    if (!settings) throw new Error("Settings not found");

    await tenantSettingsRepo.update(settings.id, data);
    audit(
      {
        action: AuditAction.AUTHENTICATION_SETTINGS_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantSettings",
        targetId: String(settings.id),
        metadata: { policy: data.emailRegistrationPolicy },
      },
      reqCtx,
    );
    revalidatePath("/admin/authentication");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.AUTHENTICATION_SETTINGS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

export const saveForce2FASettings = async (data: {
  force2FA: boolean;
  force2FAGraceDays: number;
}): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.TWO_FACTOR_ENTERPRISE);
  const reqCtx = await getRequestContext();

  try {
    const settings = await tenantSettingsRepo.findByTenantId(tenant.id);
    if (!settings) throw new Error("Settings not found");

    await tenantSettingsRepo.update(settings.id, {
      force2FA: data.force2FA,
      force2FAGraceDays: Math.min(Math.max(data.force2FAGraceDays, 0), 5),
    });

    // When force2FA is disabled, clear all pending grace period deadlines for tenant users
    if (!data.force2FA) {
      const tenantMembers = await prisma.userOnTenant.findMany({
        where: { tenantId: tenant.id },
        select: { userId: true },
      });
      if (tenantMembers.length > 0) {
        await prisma.user.updateMany({
          where: {
            id: { in: tenantMembers.map(m => m.userId) },
            twoFactorDeadline: { not: null },
          },
          data: { twoFactorDeadline: null },
        });
      }
    }

    audit(
      {
        action: AuditAction.SECURITY_SETTINGS_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantSettings",
        targetId: String(settings.id),
        metadata: { ...data },
      },
      reqCtx,
    );
    revalidatePath("/admin/authentication");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.SECURITY_SETTINGS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};

const VALID_OAUTH_PROVIDERS = ["github", "google", "proconnect"] as const;

export const saveOAuthProviders = async (data: { providers: string[] }): Promise<ServerActionResponse> => {
  const domain = await getDomainFromHost();
  const session = await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.SSO_ENTERPRISE);
  const reqCtx = await getRequestContext();

  try {
    // Validate providers against whitelist
    const validProviders = data.providers.filter((p): p is (typeof VALID_OAUTH_PROVIDERS)[number] =>
      (VALID_OAUTH_PROVIDERS as readonly string[]).includes(p),
    );

    const currentProviders = await tenantDefaultOAuthRepo.findByTenantId(tenant.id);
    const currentProviderNames = currentProviders.map(p => p.provider);

    // Add new providers
    const toAdd = validProviders.filter(p => !currentProviderNames.includes(p));
    for (const provider of toAdd) {
      await tenantDefaultOAuthRepo.upsertByTenantIdAndProvider(tenant.id, provider);
    }

    // Remove deselected providers
    const toRemove = currentProviderNames.filter(p => !(validProviders as string[]).includes(p));
    for (const provider of toRemove) {
      await tenantDefaultOAuthRepo.deleteByTenantIdAndProvider(tenant.id, provider);
    }

    audit(
      {
        action: AuditAction.AUTHENTICATION_SETTINGS_UPDATE,
        userId: session.user.uuid,
        tenantId: tenant.id,
        targetType: "TenantDefaultOAuth",
        metadata: { providers: validProviders },
      },
      reqCtx,
    );
    revalidatePath("/admin/authentication");
    return { ok: true };
  } catch (error) {
    audit(
      {
        action: AuditAction.AUTHENTICATION_SETTINGS_UPDATE,
        success: false,
        error: (error as Error).message,
        userId: session.user.uuid,
        tenantId: tenant.id,
      },
      reqCtx,
    );
    return { ok: false, error: (error as Error).message };
  }
};
