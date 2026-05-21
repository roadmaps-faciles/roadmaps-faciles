import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { cn } from "@roadmaps-faciles/ui";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { connection } from "next/server";
import { type PropsWithChildren, Suspense } from "react";

import { config } from "@/config";
import { DsfrProvider } from "@/gouv/dsfr-bootstrap";
import { prisma } from "@/lib/db/prisma";
import { UIProvider } from "@/ui";
import { UIAlert } from "@/ui/bridge";
import { DsfrCssLoaderClient } from "@/ui/DsfrCssLoaderClient";
import { getTheme } from "@/ui/server";
import { ThemeInjector } from "@/ui/ThemeInjector";
import { getTenantFromDomain } from "@/utils/tenant";

import { EmbedThemeForcer } from "./EmbedThemeForcer";

interface EmbedLayoutProps extends PropsWithChildren {
  params: Promise<{ domain: string }>;
}

const EmbedLayoutInner = async ({ children, params }: EmbedLayoutProps) => {
  await connection();

  const [{ domain }, lang] = await Promise.all([params, getLocale()]);
  const tenant = await getTenantFromDomain(domain);
  const tenantSettings = await prisma.tenantSettings.findFirst({
    where: { tenantId: tenant.id },
  });

  const t = await getTranslations("embed");
  const theme = await getTheme(tenantSettings);

  if (!tenantSettings?.allowEmbedding) {
    return (
      <DsfrProvider lang={lang}>
        <UIProvider value={theme}>
          <ThemeInjector theme={theme} />
          {theme === "Dsfr" && <DsfrCssLoaderClient />}
          <main className="flex items-center justify-center min-h-50 p-6">
            <UIAlert variant="destructive" description={t("embeddingDisabled")} />
          </main>
        </UIProvider>
      </DsfrProvider>
    );
  }

  return (
    <DsfrProvider lang={lang}>
      <UIProvider value={theme}>
        <ThemeInjector theme={theme} />
        {theme === "Dsfr" && <DsfrCssLoaderClient />}
        <AppRouterCacheProvider>
          <MuiDsfrThemeProvider>
            <EmbedThemeForcer />
            <main className="pb-4">{children}</main>
            <footer className={cn("py-2 px-4 text-center")}>
              <span className="text-xs text-muted-foreground">
                {t("poweredBy", { name: config.brand.name })}
                {" · "}
                <Link href={`${config.host}`} target="_blank" className="text-xs text-primary underline">
                  {config.host}
                </Link>
              </span>
            </footer>
          </MuiDsfrThemeProvider>
        </AppRouterCacheProvider>
      </UIProvider>
    </DsfrProvider>
  );
};

const EmbedLayout = (props: EmbedLayoutProps) => (
  <Suspense>
    <EmbedLayoutInner {...props} />
  </Suspense>
);

export default EmbedLayout;
