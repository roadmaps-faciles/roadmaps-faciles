import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { organizationRepo } from "@/lib/repo";

const OrgTenantsPage = async ({ params }: { params: Promise<{ orgSlug: string }> }) => {
  await connection();
  const { orgSlug } = await params;
  const [org, t] = await Promise.all([organizationRepo.findBySlug(orgSlug), getTranslations("orgAdmin.tenants")]);
  if (!org) notFound();

  const tenants = await prisma.tenant.findMany({
    where: { organizationId: org.id },
    include: { settings: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      {tenants.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {tenants.map(tenant => (
            <div key={tenant.id} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="font-medium">{tenant.settings?.name ?? `Tenant #${tenant.id}`}</p>
                <p className="text-sm text-muted-foreground">{tenant.settings?.subdomain}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={tenant.deletedAt ? "destructive" : "default"}>
                  {tenant.deletedAt ? t("deleted") : t("active")}
                </Badge>
                {tenant.settings && !tenant.deletedAt && (
                  <Link
                    href={`//${tenant.settings.subdomain}.${config.rootDomain}/admin`}
                    className="text-sm text-primary hover:underline"
                  >
                    {t("goToAdmin")}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default OrgTenantsPage;
