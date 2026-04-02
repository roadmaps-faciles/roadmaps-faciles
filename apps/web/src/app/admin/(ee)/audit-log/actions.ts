"use server";

import { auditLogRepo } from "@/lib/repo";
import { type AuditAction } from "@/prisma/enums";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export const exportAuditLogCSV = async (filter: {
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ServerActionResponse<string>> => {
  await assertAdmin();

  const items = await auditLogRepo.findAll({
    action: (filter.action as AuditAction) || undefined,
    dateFrom: filter.dateFrom ? new Date(filter.dateFrom) : undefined,
    dateTo: filter.dateTo ? new Date(`${filter.dateTo}T23:59:59`) : undefined,
  });

  const header = "Date;Action;Utilisateur;Tenant;Cible;Statut;IP";
  const rows = items.map(item => {
    const date = new Date(item.createdAt).toISOString().replace("T", " ").slice(0, 19);
    const user = item.user?.name ?? item.user?.email ?? item.userId ?? "";
    const tenantId = item.tenantId ? `#${item.tenantId}` : "";
    const target = item.targetType ? `${item.targetType}${item.targetId ? ` #${item.targetId}` : ""}` : "";
    const status = item.success ? "Succès" : "Erreur";
    const ip = item.ipAddress ?? "";
    return [date, item.action, user, tenantId, target, status, ip].join(";");
  });

  const csv = `\uFEFF${header}\n${rows.join("\n")}`;
  return { ok: true, data: csv };
};
