import { Badge } from "@roadmaps-faciles/ui";
import { Map } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { config } from "@/config";
import { isSelfHost } from "@/lib/deployment";
import { ConsentManagementLink } from "@/ui/ConsentManagementLink";
import { RootFooter } from "@/ui/RootFooter";

// Managed offering: self-host footer points its non-legal links here (legal stays local, config-driven).
const CLOUD_URL = "https://roadmaps-faciles.fr";

export interface DefaultFooterProps {
  id: string;
}

export const DefaultFooter = async ({ id }: DefaultFooterProps) => {
  const [t, selfHost] = await Promise.all([getTranslations("footer"), isSelfHost()]);
  const link = (path: string) => (selfHost ? `${CLOUD_URL}${path}` : path);

  const columns = [
    {
      title: t("columns.product.title"),
      links: [
        { text: t("columns.product.features"), href: link("/pricing") },
        { text: t("columns.product.publicRoadmap"), href: link("/roadmap") },
        { text: t("columns.product.hosting"), href: link("/doc/technical/self-hosting") },
      ],
    },
    {
      title: t("columns.resources.title"),
      links: [
        { text: t("columns.resources.documentation"), href: link("/doc") },
        { text: t("columns.resources.github"), href: config.repositoryUrl },
      ],
    },
    {
      title: t("columns.legal.title"),
      links: [
        { text: t("columns.legal.legalNotice"), href: "/mentions-legales" },
        { text: t("columns.legal.privacy"), href: "/politique-de-confidentialite" },
        { text: t("columns.legal.accessibility"), href: "/accessibilite" },
        { text: t("columns.legal.cgu"), href: "/cgu" },
      ],
    },
  ];

  return (
    <RootFooter
      id={id}
      brandName={config.brand.name}
      brandIcon={<Map className="size-5" />}
      contentDescription={t("contentDescription")}
      columns={columns}
      badges={
        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
          AGPL v3
        </Badge>
      }
      copyright={t("copyright", { year: new Date().getFullYear(), brandName: config.brand.name })}
      license={
        <>
          {t.rich("license", {
            a: chunks => (
              <a
                href={`${config.repositoryUrl}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground"
              >
                {chunks}
              </a>
            ),
          })}
        </>
      }
      version={`v${config.appVersion}.${config.appVersionCommit.slice(0, 7)}`}
      bottomExtra={<ConsentManagementLink />}
    />
  );
};
