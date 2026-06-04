import "server-only";
import { forbidden } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { isSelfHost } from "@/lib/deployment";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { ADDON_TYPE, type AddonType, ORG_PLAN } from "@/lib/model/Organization";
import { orgAddonRepo, organizationRepo } from "@/lib/repo";

export const FREE_TIER_ADDONS = new Set<AddonType>([ADDON_TYPE.STORAGE_S3]);

export async function hasEntitlement(tenantId: number, addon: AddonType): Promise<boolean> {
  // Self-host: license-based all-or-nothing. No/invalid license = community = free tier only.
  if (await isSelfHost()) {
    const status = await getLicenseStatus();
    if (!status.valid) return FREE_TIER_ADDONS.has(addon);
    if (addon === ADDON_TYPE.THEME_DSFR) return status.plan === "GOV_LICENSED";
    return true; // Licensed = all EE features
  }

  // Cloud mode: DB-based entitlements
  const org = await organizationRepo.findByTenantId(tenantId);
  if (!org) return false;

  // THEME_DSFR : only for Gov plan
  if (addon === ADDON_TYPE.THEME_DSFR) {
    return org.plan === ORG_PLAN.GOV;
  }

  // GOV / GRANTED_FREE: all addons are entitled
  if (org.plan === ORG_PLAN.GOV || org.plan === ORG_PLAN.GRANTED_FREE) {
    return true;
  }

  // Check addon global OR tenant-specific
  const active = await orgAddonRepo.isActiveForTenant(org.id, tenantId, addon);
  if (active) return true;

  // Free tier fallback
  return FREE_TIER_ADDONS.has(addon);
}

export async function assertEntitlement(tenantId: number, addon: AddonType): Promise<void> {
  if (!(await hasEntitlement(tenantId, addon))) {
    forbidden();
  }
}

/**
 * Check if a specific org can create additional tenants.
 * First tenant is always free. 2nd+ requires MULTI_TENANT addon (or GOV/GRANTED_FREE plan).
 *
 * @param tx - Optional Prisma transaction client. When provided, all reads happen
 * inside the transaction to prevent TOCTOU races (used by CreateNewTenant's
 * Serializable transaction with SELECT FOR UPDATE).
 */
export async function canCreateTenant(
  orgId: number,
  currentTenantCount: number,
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<boolean> {
  if (currentTenantCount === 0) return true; // First tenant is always free

  // Self-host: licensed = unlimited tenants, community = first tenant only.
  // License-based and lock-independent, so it ignores tx (no org/addon rows read).
  if (await isSelfHost()) {
    return (await getLicenseStatus()).valid;
  }

  const client = tx ?? prisma;
  const org = await client.organization.findUnique({ where: { id: orgId } });
  if (!org) return false;

  // GOV / GRANTED_FREE: unlimited tenants
  if (org.plan === ORG_PLAN.GOV || org.plan === ORG_PLAN.GRANTED_FREE) {
    return true;
  }

  // Check MULTI_TENANT addon
  const addon = await client.orgAddon.findFirst({
    where: { organizationId: org.id, tenantId: null, addon: ADDON_TYPE.MULTI_TENANT, active: true },
  });
  return !!addon;
}
