import { getLocale, getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { auditLogRepo } from "@/lib/repo";
import { type AuditAction } from "@/prisma/enums";
import { assertAdmin } from "@/utils/auth";

import { AuditLogView } from "./AuditLogView";

const PAGE_SIZE = 25;

const getAuditStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalCount, todayCount, uniqueUsers, errorCount] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { createdAt: { gte: today } } }),
    prisma.$queryRaw<
      Array<{ count: bigint }>
    >`SELECT COUNT(DISTINCT "userId") as count FROM "AuditLog" WHERE "userId" IS NOT NULL`.then(r =>
      Number(r[0].count),
    ),
    prisma.auditLog.count({ where: { success: false } }),
  ]);

  return {
    totalCount,
    todayCount,
    uniqueUsers,
    errorRate: totalCount > 0 ? (errorCount / totalCount) * 100 : 0,
  };
};

const RootAuditLogPage = async (props: { searchParams: Promise<Record<string, string | undefined>> }) => {
  await connection();
  await assertAdmin();

  const searchParams = await props.searchParams;
  const [locale, t] = await Promise.all([getLocale(), getTranslations("rootAdmin")]);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const action = searchParams.action as AuditAction | undefined;
  const dateFrom = searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined;
  const dateTo = searchParams.dateTo ? new Date(`${searchParams.dateTo}T23:59:59`) : undefined;

  const [result, actions, stats] = await Promise.all([
    auditLogRepo.findPaginated({ action, dateFrom, dateTo }, page, PAGE_SIZE),
    auditLogRepo.getDistinctActions(),
    getAuditStats(),
  ]);

  return (
    <>
      <AdminPageHeader title={t("auditLog.title")} />
      <AuditLogView
        items={result.items}
        total={result.total}
        page={page}
        pageSize={PAGE_SIZE}
        actions={actions}
        locale={locale}
        stats={stats}
      />
    </>
  );
};

export default RootAuditLogPage;
