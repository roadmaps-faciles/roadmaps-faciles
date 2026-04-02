"use server";

import { assertEntitlement } from "@/lib/ee/entitlements";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { auditLogRepo } from "@/lib/repo";
import { type AuditAction } from "@/prisma/enums";
import { assertTenantAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";
import { getDomainFromHost, getTenantFromDomain } from "@/utils/tenant";

export const exportAuditLogCSV = async (filter: {
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ServerActionResponse<string>> => {
  const domain = await getDomainFromHost();
  await assertTenantAdmin(domain);
  const tenant = await getTenantFromDomain(domain);
  await assertEntitlement(tenant.id, ADDON_TYPE.AUDIT_LOG);

  const items = await auditLogRepo.findAll({
    tenantId: tenant.id,
    action: (filter.action as AuditAction) || undefined,
    dateFrom: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
    dateTo: filter.dateTo ? new Date(`${filter.dateTo}T23:59:59`) : undefined,
  });

  const header = "Date;Action;Utilisateur;Cible;Statut;IP";
  const rows = items.map(item => {
    const date = new Date(item.createdAt).toISOString().replace("T", " ").slice(0, 19);
    const user = item.user?.name ?? item.user?.email ?? item.userId ?? "";
    const target = item.targetType ? `${item.targetType}${item.targetId ? ` #${item.targetId}` : ""}` : "";
    const status = item.success ? "Succès" : "Erreur";
    const ip = item.ipAddress ?? "";
    return [date, item.action, user, target, status, ip].join(";");
  });

  const csv = `\uFEFF${header}\n${rows.join("\n")}`;
  return { ok: true, data: csv };
};
