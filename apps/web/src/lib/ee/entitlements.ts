import "server-only";
import { forbidden } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { isSelfHost } from "@/lib/deployment";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { ADDON_TYPE, type AddonType, FREE_TIER_ADDONS, ORG_PLAN } from "@/lib/model/Organization";
import { orgAddonRepo, organizationRepo } from "@/lib/repo";

export { FREE_TIER_ADDONS };

/**
 * Resolve several addons in one shot (one org lookup + one override query), to avoid the N+1 of
 * calling hasEntitlement per addon (e.g. sidebar lock markers). Single source of truth for the rules;
 * hasEntitlement delegates here.
 */
export async function hasEntitlements(
  tenantId: number,
  addons: readonly AddonType[],
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};

  // Self-host: the instance license is the ceiling (which addons are *available*). Everything covered
  // is ON by default for every org; the instance admin can turn specific addons OFF per org (denylist
  // override). Free tier is always available.
  if (await isSelfHost()) {
    const status = await getLicenseStatus();
    const org = status.valid ? await organizationRepo.findByTenantId(tenantId) : null;
    const disabled = org
      ? new Set<string>(await orgAddonRepo.listOverridesForTenant(org.id, tenantId, false))
      : new Set<string>();
    for (const addon of addons) {
      if (FREE_TIER_ADDONS.has(addon)) result[addon] = true;
      else if (!status.valid || !org) result[addon] = false;
      else if (addon === ADDON_TYPE.THEME_DSFR && status.plan !== "GOV_LICENSED") result[addon] = false;
      else result[addon] = !disabled.has(addon); // on unless explicitly disabled
    }
    return result;
  }

  // Cloud: DB-based entitlements (allowlist).
  const org = await organizationRepo.findByTenantId(tenantId);
  const grantsAll = org?.plan === ORG_PLAN.GOV || org?.plan === ORG_PLAN.GRANTED_FREE;
  const active =
    org && !grantsAll
      ? new Set<string>(await orgAddonRepo.listOverridesForTenant(org.id, tenantId, true))
      : new Set<string>();
  for (const addon of addons) {
    if (!org) result[addon] = false;
    else if (addon === ADDON_TYPE.THEME_DSFR) result[addon] = org.plan === ORG_PLAN.GOV;
    else if (grantsAll) result[addon] = true;
    else result[addon] = active.has(addon) || FREE_TIER_ADDONS.has(addon);
  }
  return result;
}

export async function hasEntitlement(tenantId: number, addon: AddonType): Promise<boolean> {
  return (await hasEntitlements(tenantId, [addon]))[addon];
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
