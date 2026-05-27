import { Badge, Button, Card } from "@roadmaps-faciles/ui";
import { ArrowRight, Building2, ExternalLink, Plus, Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { auth } from "@/lib/next-auth/auth";
import { getUserMenuContext } from "@/lib/utils/userMenuContext";
import { assertSession } from "@/utils/auth";

const WorkspacesPage = async () => {
  await assertSession();
  const t = await getTranslations("workspaces");
  const tRoles = await getTranslations("roles");

  const fullSession = await auth();
  if (!fullSession) return null;

  const menuData = await getUserMenuContext({ session: fullSession });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/workspaces/new">
            <Plus className="mr-2 size-4" />
            {t("newWorkspace")}
          </Link>
        </Button>
      </div>

      {menuData.organizations.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Button asChild className="mt-4">
            <Link href="/workspaces/new">
              <Plus className="mr-2 size-4" />
              {t("newWorkspace")}
            </Link>
          </Button>
        </Card>
      )}

      {menuData.organizations.map(org => (
        <section key={org.id} className="mb-8">
          {/* Org header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{org.name}</h2>
              <Badge variant="outline">{tRoles(org.role as "OWNER")}</Badge>
            </div>
            {org.orgAdminHref && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={org.orgAdminHref}>
                  <Settings className="mr-2 size-4" />
                  {t("orgAdmin")}
                </Link>
              </Button>
            )}
          </div>

          {/* Tenants list */}
          <div className="space-y-2">
            {org.tenants.map(tenant => (
              <Card
                key={tenant.id}
                className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${!tenant.isMember ? "opacity-60" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{tenant.name}</span>
                    {tenant.isMember ? (
                      <Badge variant="secondary">{tRoles((tenant.role ?? "MEMBER") as "OWNER")}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        {t("notRegistered")}
                      </Badge>
                    )}
                    {tenant.isPrivate && (
                      <Badge variant="outline" className="text-xs">
                        {t("private")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{tenant.subdomain}</p>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">
                  {tenant.tenantAdminHref && (
                    <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                      <Link href={tenant.tenantAdminHref}>
                        <Settings className="mr-1.5 size-3.5" />
                        {t("admin")}
                      </Link>
                    </Button>
                  )}
                  {tenant.isMember ? (
                    <Button variant="ghost" size="sm" asChild className="flex-1 sm:flex-initial">
                      <Link href={tenant.href}>
                        {t("open")}
                        <ArrowRight className="ml-1.5 size-3.5" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" asChild className="flex-1 sm:flex-initial">
                      <Link href={`${tenant.href}/signup`}>
                        <ExternalLink className="mr-1.5 size-3.5" />
                        {t("join")}
                      </Link>
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {org.tenants.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">{t("noTenants")}</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};

export default WorkspacesPage;
