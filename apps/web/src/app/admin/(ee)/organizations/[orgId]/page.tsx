import { Badge, Button, Separator } from "@roadmaps-faciles/ui";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { isSelfHost } from "@/lib/deployment";
import { orgAddonRepo, orgDomainRepo, orgMemberRepo, organizationRepo } from "@/lib/repo";
import { type NextServerPageProps } from "@/utils/next";

import { PLAN_BADGE_VARIANT } from "../_constants";
import { RootOrgActions } from "./RootOrgActions";

const OrgDetailPage = async ({ params }: NextServerPageProps<{ orgId: string }>) => {
  await connection();

  const { orgId: orgIdParam } = await params;
  const orgId = Number(orgIdParam);
  if (isNaN(orgId)) notFound();

  const org = await organizationRepo.findById(orgId);
  if (!org) notFound();

  const [members, domains, addons, tenants] = await Promise.all([
    orgMemberRepo.findByOrgId(org.id),
    orgDomainRepo.findByOrgId(org.id),
    orgAddonRepo.findByOrgId(org.id),
    prisma.tenant.findMany({ where: { organizationId: org.id, deletedAt: null } }),
  ]);
  const [t, locale, selfHost] = await Promise.all([getTranslations("adminOrganizations"), getLocale(), isSelfHost()]);

  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div>
      <AdminPageHeader
        title={org.name}
        description={org.slug}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/organizations">{t("back")}</Link>
          </Button>
        }
      />

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">{t("information")}</h2>
        <dl className="space-y-1">
          <div>
            <dt className="inline font-bold">{t("id")} :</dt> <dd className="inline">{org.id}</dd>
          </div>
          <div>
            <dt className="inline font-bold">{t("slug")} :</dt> <dd className="inline">{org.slug}</dd>
          </div>
          {!selfHost && (
            <>
              <div>
                <dt className="inline font-bold">{t("plan")} :</dt>{" "}
                <dd className="inline">
                  <Badge variant={PLAN_BADGE_VARIANT[org.plan] ?? "secondary"}>{org.plan}</Badge>
                </dd>
              </div>
              <div>
                <dt className="inline font-bold">Stripe :</dt> <dd className="inline">{org.stripeCustomerId ?? "-"}</dd>
              </div>
            </>
          )}
          <div>
            <dt className="inline font-bold">{t("createdAt")} :</dt>{" "}
            <dd className="inline">{dateFormatter.format(new Date(org.createdAt))}</dd>
          </div>
        </dl>
      </div>

      <Separator className="my-6" />

      <RootOrgActions activeAddons={addons} org={org} selfHost={selfHost} />

      <Separator className="my-6" />

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          {t("members")} ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noMembers")}</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between rounded-md border px-4 py-2">
                <div>
                  <p className="text-sm font-medium">{m.user.name ?? m.user.email}</p>
                  <p className="text-xs text-muted-foreground">{m.user.email}</p>
                </div>
                <Badge variant="outline">{m.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          {t("tenants")} ({tenants.length})
        </h2>
        {tenants.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noTenants")}</p>
        ) : (
          <div className="space-y-2">
            {tenants.map(tt => (
              <div key={tt.id} className="flex items-center justify-between rounded-md border px-4 py-2">
                <p className="text-sm font-medium">Tenant #{tt.id}</p>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/tenants/${tt.id}`}>{t("detail")}</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          {t("domains")} ({domains.length})
        </h2>
        {domains.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noDomains")}</p>
        ) : (
          <div className="space-y-2">
            {domains.map(d => (
              <div key={d.id} className="flex items-center justify-between rounded-md border px-4 py-2">
                <div>
                  <p className="text-sm font-medium">{d.domain}</p>
                  {d.isGouv && (
                    <Badge variant="default" className="text-xs">
                      gouv.fr
                    </Badge>
                  )}
                </div>
                <Badge variant={d.verifiedAt ? "default" : "secondary"}>
                  {d.verifiedAt ? t("verified") : t("pending")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {selfHost ? (
        // Denylist: everything covered is on by default; show what's been turned off for this org.
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            {t("addonsDisabled")} ({addons.filter(a => !a.active).length})
          </h2>
          {addons.filter(a => !a.active).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("allAddonsActive")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {addons
                .filter(a => !a.active)
                .map(a => (
                  <Badge key={a.id} variant="destructive">
                    {a.addon}
                    {a.tenantId && <span className="ml-1 text-xs">(tenant #{a.tenantId})</span>}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            {t("addons")} ({addons.filter(a => a.active).length})
          </h2>
          {addons.filter(a => a.active).length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noAddons")}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {addons
                .filter(a => a.active)
                .map(a => (
                  <Badge key={a.id} variant="outline">
                    {a.addon}
                    {a.tenantId && <span className="ml-1 text-xs text-muted-foreground">(tenant #{a.tenantId})</span>}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrgDetailPage;
