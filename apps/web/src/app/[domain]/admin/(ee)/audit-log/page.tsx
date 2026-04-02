import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EntitlementGate } from "@/components/admin/EntitlementGate";
import { prisma } from "@/lib/db/prisma";
import { DomainPageHOP } from "@/lib/DomainPage";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { auditLogRepo } from "@/lib/repo";
import { type AuditAction } from "@/prisma/enums";

import { AuditLogView } from "./AuditLogView";

const PAGE_SIZE = 25;

const getAuditStats = async (tenantId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalCount, todayCount, uniqueUsers, errorCount] = await Promise.all([
    prisma.auditLog.count({ where: { tenantId } }),
    prisma.auditLog.count({ where: { tenantId, createdAt: { gte: today } } }),
    prisma.auditLog
      .findMany({ where: { tenantId, userId: { not: null } }, select: { userId: true }, distinct: ["userId"] })
      .then(r => r.length),
    prisma.auditLog.count({ where: { tenantId, success: false } }),
  ]);

  return {
    totalCount,
    todayCount,
    uniqueUsers,
    errorRate: totalCount > 0 ? (errorCount / totalCount) * 100 : 0,
  };
};

const AuditLogPage = DomainPageHOP()(async props => {
  const { tenant } = props._data;
  const searchParams = await (props as unknown as { searchParams: Promise<Record<string, string | undefined>> })
    .searchParams;
  const [locale, t] = await Promise.all([getLocale(), getTranslations("domainAdmin.auditLog")]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <EntitlementGate tenantId={tenant.id} addon={ADDON_TYPE.AUDIT_LOG}>
        <AuditLogContent tenantId={tenant.id} searchParams={searchParams} locale={locale} />
      </EntitlementGate>
    </>
  );
});

const AuditLogContent = async ({
  tenantId,
  searchParams,
  locale,
}: {
  locale: string;
  searchParams: Record<string, string | undefined>;
  tenantId: number;
}) => {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const action = searchParams.action as AuditAction | undefined;
  const dateFrom = searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined;
  const dateTo = searchParams.dateTo ? new Date(`${searchParams.dateTo}T23:59:59`) : undefined;

  const [result, actions, stats] = await Promise.all([
    auditLogRepo.findPaginated({ tenantId, action, dateFrom, dateTo }, page, PAGE_SIZE),
    auditLogRepo.getDistinctActions(tenantId),
    getAuditStats(tenantId),
  ]);

  return (
    <Suspense>
      <AuditLogView
        items={result.items}
        total={result.total}
        page={page}
        pageSize={PAGE_SIZE}
        actions={actions}
        locale={locale}
        stats={stats}
      />
    </Suspense>
  );
};

export default AuditLogPage;
