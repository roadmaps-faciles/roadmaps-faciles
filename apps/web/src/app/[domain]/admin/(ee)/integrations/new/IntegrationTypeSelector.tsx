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

      <Card className="opacity-50">
        <CardHeader>
          <CardTitle>
            {t("github")} <span className="text-xs font-normal text-muted-foreground">{t("comingSoon")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("githubDescription")}</p>
        </CardContent>
      </Card>
    </div>
  );
};
