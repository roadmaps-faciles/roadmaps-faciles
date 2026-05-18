"use client";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@roadmaps-faciles/ui";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { type TenantIntegration } from "@/prisma/client";

interface IntegrationsListProps {
  integrations: TenantIntegration[];
}

export const IntegrationsList = ({ integrations }: IntegrationsListProps) => {
  const t = useTranslations("domainAdmin.integrations");

  return (
    <div>
      <div className="mb-6">
        <Button asChild>
          <Link href="/admin/integrations/new">
            <Plus className="mr-1 size-4" />
            {t("add")}
          </Link>
        </Button>
      </div>

      {integrations.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground">{t("empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map(integration => (
            <Link key={integration.id} href={`/admin/integrations/${integration.id}`} className="block">
              <Card className="transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle>{integration.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={integration.enabled ? "default" : "secondary"}>
                      {integration.enabled ? t("enabled") : t("disabled")}
                    </Badge>
                    <Badge variant="outline">{integration.type}</Badge>
                    {integration.lastSyncAt && (
                      <span className="text-sm text-muted-foreground">
                        {t("lastSync", { date: new Date(integration.lastSyncAt).toLocaleString() })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
