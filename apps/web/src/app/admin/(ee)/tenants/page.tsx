import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Separator } from "@roadmaps-faciles/ui";
import { ExternalLink, Pin, PinOff, Plus, Users } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CopyButton } from "@/components/CopyButton";
import { config } from "@/config";
import { Link } from "@/i18n/navigation";
import { appSettingsRepo, tenantRepo } from "@/lib/repo";
import { ListAllTenants } from "@/useCases/tenant/ListAllTenants";

import { pinTenant } from "./actions";

const TenantsPage = async () => {
  await connection();

  const [useCase, appSettings, t, tc, locale] = await Promise.all([
    Promise.resolve(new ListAllTenants(tenantRepo)),
    appSettingsRepo.get(),
    getTranslations("adminTenants"),
    getTranslations("common"),
    getLocale(),
  ]);
  const tenants = await useCase.execute();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div>
      <AdminPageHeader
        title={t("title")}
        description={t("tenantCount", { count: tenants.length })}
        actions={
          <Button asChild>
            <Link href="/admin/tenants/new">
              <Plus className="size-4" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenants.map(tenant => {
          const tenantUrl = `${config.host.replace("://", `://${tenant.settings.subdomain}.`)}`;
          const isPinned = tenant.id === appSettings.pinnedTenantId;

          return (
            <Card key={tenant.id} className="relative">
              {isPinned && (
                <Badge variant="secondary" className="absolute right-3 top-3 text-xs">
                  <Pin className="mr-1 size-3" />
                  {t("pin")}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{tenant.settings.name ?? `Tenant #${tenant.id}`}</CardTitle>
                <div className="space-y-1">
                  <Link
                    href={tenantUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {tenant.settings.subdomain}.{config.rootDomain}
                    <ExternalLink className="size-3" />
                  </Link>
                  {tenant.settings.customDomain && (
                    <p className="text-xs text-muted-foreground">{tenant.settings.customDomain}</p>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-4" />
                    {tenant._count.members} {t("members").toLowerCase()}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{dateFormatter.format(new Date(tenant.createdAt))}</span>
                </div>
                {tenant.members.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tenant.members.map(m => (
                      <CopyButton
                        key={m.user.email}
                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted/80"
                        value={m.user.email}
                      >
                        {m.user.name ?? m.user.email}
                      </CopyButton>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/admin/tenants/${tenant.id}`}>{tc("detail")}</Link>
                </Button>
                <form action={pinTenant.bind(null, tenant.id)}>
                  <Button type="submit" variant={isPinned ? "secondary" : "ghost"} size="icon-sm">
                    {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    <span className="sr-only">{isPinned ? t("unpin") : t("pin")}</span>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TenantsPage;
