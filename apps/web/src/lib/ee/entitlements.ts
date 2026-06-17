import "server-only";
import { forbidden } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { isSelfHost } from "@/lib/deployment";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { ADDON_TYPE, type AddonType, ORG_PLAN } from "@/lib/model/Organization";
import { orgAddonRepo, organizationRepo } from "@/lib/repo";

export const FREE_TIER_ADDONS = new Set<AddonType>([ADDON_TYPE.STORAGE_S3]);

export async function hasEntitlement(tenantId: number, addon: AddonType): Promise<boolean> {
  // Self-host: the instance license is the ceiling (which addons are *available*). Everything covered
  // is ON by default for every org; the instance admin can turn specific addons OFF per org (denylist
  // override). Free tier is always available.
  if (await isSelfHost()) {
    if (FREE_TIER_ADDONS.has(addon)) return true;
    const status = await getLicenseStatus();
    if (!status.valid) return false; // no valid license: nothing beyond the free tier
    if (addon === ADDON_TYPE.THEME_DSFR && status.plan !== "GOV_LICENSED") return false; // DSFR needs a gov license
    const org = await organizationRepo.findByTenantId(tenantId);
    if (!org) return false;
    return !(await orgAddonRepo.isDisabledForTenant(org.id, tenantId, addon)); // on unless explicitly disabled
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

  const client = tx ?? prisma;

  // Self-host: like any other addon, multi-tenant is covered by the license and ON by default; the
  // instance admin can disable it per org (denylist). First tenant already returned above.
  if (await isSelfHost()) {
    if (!(await getLicenseStatus()).valid) return false;
    const disabled = await client.orgAddon.findFirst({
      where: { organizationId: orgId, tenantId: null, addon: ADDON_TYPE.MULTI_TENANT, active: false },
    });
    return !disabled;
  }

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
