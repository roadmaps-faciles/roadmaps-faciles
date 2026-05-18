"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";

export const IntegrationTypeSelector = () => {
  const t = useTranslations("domainAdmin.integrations.typeSelector");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link href="/admin/integrations/new?type=NOTION">
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle>{t("notion")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("notionDescription")}</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/admin/integrations/new?type=GITHUB">
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <CardTitle>{t("github")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("githubDescription")}</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};
