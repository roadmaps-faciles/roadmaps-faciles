import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Separator,
} from "@roadmaps-faciles/ui";
import { Building2, Globe, Users } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { isSelfHost } from "@/lib/deployment";
import { getLicenseStatus } from "@/lib/ee/licensing/licenseService";
import { ADDON_TYPE } from "@/lib/model/Organization";
import { organizationRepo } from "@/lib/repo";
import { OrgPlan } from "@/prisma/enums";
import { type NextServerPageProps } from "@/utils/next";

import { PLAN_BADGE_VARIANT } from "./_constants";

const PAGE_SIZE = 18;

const OrganizationsPage = async ({
  searchParams,
}: NextServerPageProps<never, { page?: string; plan?: string; search?: string }>) => {
  await connection();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const ORG_PLAN_ENUM = z.enum(Object.values(OrgPlan) as [string, ...string[]]);
  const planResult = ORG_PLAN_ENUM.safeParse(sp.plan);
  const plan = planResult.success ? (planResult.data as OrgPlan) : undefined;
  const search = sp.search || undefined;

  const filters = { plan, search };

  const [orgs, total, t, locale] = await Promise.all([
    organizationRepo.findAll(filters, page, PAGE_SIZE),
    organizationRepo.count(filters),
    getTranslations("adminOrganizations"),
    getLocale(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  // Self-host: the org "plan" is meaningless; reflect the instance license instead, and show how many
  // addons are active per org (covered by the license minus the per-org denylist overrides).
  const selfHost = await isSelfHost();
  const licenseStatus = selfHost ? await getLicenseStatus() : null;
  const licensed = !!licenseStatus?.valid;
  // Addons the license actually covers (DSFR needs a gov license). Count disabled overrides only among
  // these, so "active / covered" can never go negative.
  const coveredAddonKeys = Object.values(ADDON_TYPE).filter(
    a => licenseStatus?.plan === "GOV_LICENSED" || a !== ADDON_TYPE.THEME_DSFR,
  );
  const coveredAddons = coveredAddonKeys.length;
  const disabledByOrg = new Map<number, number>();
  if (selfHost && licensed && orgs.length > 0) {
    const rows = await prisma.orgAddon.findMany({
      where: {
        active: false,
        tenantId: null,
        addon: { in: coveredAddonKeys },
        organizationId: { in: orgs.map(o => o.id) },
      },
      select: { organizationId: true },
    });
    for (const r of rows) disabledByOrg.set(r.organizationId, (disabledByOrg.get(r.organizationId) ?? 0) + 1);
  }
  const licenseBadge = !licenseStatus
    ? null
    : licenseStatus.mode === "community"
      ? { label: t("licenseCommunity"), variant: "outline" as const }
      : !licenseStatus.valid
        ? { label: t("licenseExpired"), variant: "destructive" as const }
        : {
            label: licenseStatus.plan === "GOV_LICENSED" ? t("licenseGov") : t("licensed"),
            variant: "default" as const,
          };

  return (
    <div>
      <AdminPageHeader title={t("title")} description={t("orgCount", { count: total })} />

      <form className="mb-6 flex flex-wrap items-center gap-3">
        <Input name="search" placeholder={t("searchPlaceholder")} defaultValue={search ?? ""} className="max-w-xs" />
        <select name="plan" defaultValue={plan ?? ""} className="rounded-md border px-3 py-2 text-sm">
          <option value="">{t("allPlans")}</option>
          {Object.keys(PLAN_BADGE_VARIANT).map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">
          {t("filter")}
        </Button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orgs.map(org => (
          <Card key={org.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{org.name}</CardTitle>
                {selfHost && licenseBadge ? (
                  <Badge variant={licenseBadge.variant}>{licenseBadge.label}</Badge>
                ) : (
                  <Badge variant={PLAN_BADGE_VARIANT[org.plan] ?? "secondary"}>{org.plan}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{org.slug}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="size-4" />
                  {org._count.members}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1">
                  <Building2 className="size-4" />
                  {org._count.tenants}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1">
                  <Globe className="size-4" />
                  {org._count.domains}
                </span>
              </div>
              {selfHost && licensed && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("addonsActive", {
                    active: coveredAddons - (disabledByOrg.get(org.id) ?? 0),
                    total: coveredAddons,
                  })}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{dateFormatter.format(new Date(org.createdAt))}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/admin/organizations/${org.id}`}>{t("detail")}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Button asChild variant="outline" size="sm">
              <Link href={{ pathname: "/admin/organizations", query: { ...sp, page: String(page - 1) } }}>
                {t("previous")}
              </Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Button asChild variant="outline" size="sm">
              <Link href={{ pathname: "/admin/organizations", query: { ...sp, page: String(page + 1) } }}>
                {t("next")}
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
