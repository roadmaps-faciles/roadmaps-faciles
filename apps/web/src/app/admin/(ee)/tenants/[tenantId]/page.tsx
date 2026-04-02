import { Button } from "@roadmaps-faciles/ui";
import { ExternalLink } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { auth } from "@/lib/next-auth/auth";
import { tenantRepo, userOnTenantRepo } from "@/lib/repo";
import { ListUsersForTenant } from "@/useCases/user_on_tenant/ListUsersForTenant";
import { type NextServerPageProps } from "@/utils/next";

import { RootMembersList } from "./RootMembersList";

const TenantDetailPage = async ({ params }: NextServerPageProps<{ tenantId: string }>) => {
  await connection();

  const { tenantId: tenantIdParam } = await params;
  const tenantId = Number(tenantIdParam);
  if (isNaN(tenantId)) notFound();

  const tenant = await tenantRepo.findByIdWithSettings(tenantId);
  if (!tenant?.settings) notFound();

  const [session, t, tc, locale] = await Promise.all([
    auth(),
    getTranslations("rootAdmin"),
    getTranslations("common"),
    getLocale(),
  ]);

  const useCase = new ListUsersForTenant(userOnTenantRepo);
  const members = await useCase.execute({ tenantId: tenant.id });

  const superAdminIds = members
    .filter(m => m.user.username && config.admins.includes(m.user.username))
    .map(m => m.userId);

  const tenantUrl = `${config.host.replace("://", `://${tenant.settings.subdomain}.`)}`;

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div>
      <AdminPageHeader
        title={tenant.settings.name ?? `Tenant #${tenant.id}`}
        description={
          <Link href={tenantUrl} target="_blank" className="text-primary hover:underline">
            {tenantUrl}
          </Link>
        }
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href={`${tenantUrl}/admin`} target="_blank">
                <ExternalLink className="mr-2 size-4" />
                {t("tenantAdmin")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/tenants">{t("back")}</Link>
            </Button>
          </>
        }
      />

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">{t("information")}</h2>
        <dl className="space-y-1">
          <div>
            <dt className="inline font-bold">{t("id")} :</dt> <dd className="inline">{tenant.id}</dd>
          </div>
          <div>
            <dt className="inline font-bold">{t("subdomain")} :</dt>{" "}
            <dd className="inline">{tenant.settings.subdomain}</dd>
          </div>
          <div>
            <dt className="inline font-bold">{t("customDomain")} :</dt>{" "}
            <dd className="inline">{tenant.settings.customDomain ?? "—"}</dd>
          </div>
          <div>
            <dt className="inline font-bold">{t("private")} :</dt>{" "}
            <dd className="inline">{tenant.settings.isPrivate ? tc("yes") : tc("no")}</dd>
          </div>
          <div>
            <dt className="inline font-bold">{t("createdAt")} :</dt>{" "}
            <dd className="inline">{dateFormatter.format(new Date(tenant.createdAt))}</dd>
          </div>
        </dl>
      </div>

      <h2 className="mb-4 text-xl font-semibold">{t("members")}</h2>
      <RootMembersList
        currentUserId={session?.user.uuid ?? ""}
        members={members}
        superAdminIds={superAdminIds}
        tenantId={tenant.id}
      />
    </div>
  );
};

export default TenantDetailPage;
