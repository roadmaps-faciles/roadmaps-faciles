import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { organizationRepo } from "@/lib/repo";

const OrgAuditLogPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  await connection();
  const { orgSlug } = await params;
  const [org, t] = await Promise.all([organizationRepo.findBySlug(orgSlug), getTranslations("orgAdmin.auditLog")]);
  if (!org) notFound();

  const tenantIds = await prisma.tenant.findMany({
    where: { organizationId: org.id },
    select: { id: true },
  });

  // Fetch org member IDs for filtering member-scoped audit entries
  const orgMemberIds = await prisma.orgMember.findMany({
    where: { organizationId: org.id },
    select: { id: true },
  });

  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [
        // Tenant-scoped logs
        { tenantId: { in: tenantIds.map(t => t.id) } },
        // Org-level actions (targetId = org.id)
        {
          action: { in: ["ORG_CREATE", "ORG_UPDATE", "ORG_DELETE"] },
          targetId: String(org.id),
        },
        // Member actions (targetId = member.id)
        {
          action: { in: ["ORG_MEMBER_ADD", "ORG_MEMBER_REMOVE", "ORG_MEMBER_ROLE_UPDATE"] },
          targetId: { in: orgMemberIds.map(m => String(m.id)) },
        },
        // Addon actions (targetType = OrgAddon, matched by targetId = addon name, filter by userId in org)
        {
          action: { in: ["ORG_ADDON_TOGGLE", "ORG_DOMAIN_ADD", "ORG_DOMAIN_REMOVE", "ORG_DOMAIN_VERIFY"] },
          targetType: { in: ["OrgAddon", "OrgDomain"] },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">Aucun événement.</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div className="space-y-0.5">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.createdAt.toLocaleString()} — {log.userId ?? "system"}
                  </p>
                </div>
                {log.success === false && <span className="text-xs text-destructive">Erreur</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrgAuditLogPage;
