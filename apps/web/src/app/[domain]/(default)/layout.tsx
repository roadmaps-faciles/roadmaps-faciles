import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { type Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { ClientBodyPortal } from "@/components/utils/ClientBodyPortal";
import { ClientOnly } from "@/components/utils/ClientOnly";
import { config } from "@/config";
import { ConsentBannerAndConsentManagement } from "@/consentManagement";
import { DsfrProvider } from "@/gouv/dsfr-bootstrap";
import { prisma } from "@/lib/db/prisma";
import { type DomainParams, type DomainProps } from "@/lib/DomainPage";
import { POST_APPROVAL_STATUS } from "@/lib/model/Post";
import { auth } from "@/lib/next-auth/auth";
import { UIProvider } from "@/ui";
import { DsfrCssLoaderClient } from "@/ui/DsfrCssLoaderClient";
import { Footer as ShadcnFooter } from "@/ui/Footer";
import { Header as ShadcnHeader } from "@/ui/Header";
import { getTheme } from "@/ui/server";
import { ThemeInjector } from "@/ui/ThemeInjector";
import { UIThemeDevToggle } from "@/ui/UIThemeDevToggle";
import { getDirtyDomain } from "@/utils/dirtyDomain/getDirtyDomain";
import { dirtySafePathname } from "@/utils/dirtyDomain/pathnameDirtyCheck";
import { generateTenantMetadata } from "@/utils/metadata";
import { getTenantFromDomain } from "@/utils/tenant";
import { getUserMenuContext } from "@/utils/userMenuContext";

import { ShadcnUserHeaderItem } from "../../(default)/ShadcnUserHeaderItem";
import styles from "../../root.module.scss";
import { BridgeBanner } from "./BridgeBanner";
import { DsfrHeader } from "./DsfrHeader";
import { PublicFooter } from "./PublicFooter";
import { ShadcnDomainNavigation } from "./ShadcnDomainNavigation";

export type { DomainParams, DomainProps };

export const generateMetadata = async ({ params }: { params: Promise<DomainParams> }): Promise<Metadata> => {
  const { domain } = await params;
  return generateTenantMetadata(domain);
};

const getBoards = (tenantId: number) =>
  prisma.board.findMany({
    where: { tenantId },
    orderBy: { order: "asc" },
  });

const DashboardLayout = async ({ children, modal, params }: LayoutProps<"/[domain]">) => {
  const [dirtyDomain, tenant, lang] = await Promise.all([
    getDirtyDomain(),
    getTenantFromDomain((await params).domain),
    getLocale(),
  ]);

  const dirtyDomainFixer = dirtyDomain ? dirtySafePathname(dirtyDomain) : (pathname: string) => pathname;

  const tenantSettings = await prisma.tenantSettings.findFirst({
    where: {
      tenantId: tenant.id,
    },
  });

  if (!tenantSettings) {
    notFound();
  }

  const session = await auth();

  const [boards, pendingModerationCount, userMenu] = await Promise.all([
    getBoards(tenant.id),
    prisma.post.count({ where: { tenantId: tenant.id, approvalStatus: POST_APPROVAL_STATUS.PENDING } }),
    session ? getUserMenuContext({ session, currentTenantId: tenant.id }) : Promise.resolve(undefined),
  ]);

  const theme = await getTheme(tenantSettings);
  const homeHref = dirtyDomainFixer("/");

  const mainContent = (
    <>
      {!session && (
        <BridgeBanner rootUrl={config.host} brandName={config.brand.name} tenantName={tenantSettings.name} />
      )}
      <ClientAnimate as="main" id="content" className={styles.content}>
        {children}
      </ClientAnimate>

      <ClientOnly>
        <ClientBodyPortal>{modal}</ClientBodyPortal>
      </ClientOnly>
    </>
  );

  // DsfrProvider + MuiDsfrThemeProvider always wrap content because tenant page
  // components (BoardPost, PostList, etc.) still use DSFR hooks (useIsDark) and
  // components (Card, Badge, Tag). Only Header/Footer switch based on theme.
  return (
    <UIProvider value={theme}>
      <ThemeInjector theme={theme} />
      <DsfrProvider lang={lang}>
        {theme === "Dsfr" && <DsfrCssLoaderClient />}
        {theme === "Dsfr" && <ConsentBannerAndConsentManagement />}
        <AppRouterCacheProvider>
          <MuiDsfrThemeProvider>
            {theme === "Dsfr" ? (
              <DsfrHeader
                boards={boards}
                homeHref={homeHref}
                pendingModerationCount={pendingModerationCount}
                tenantSettings={tenantSettings}
                userMenu={userMenu}
              />
            ) : (
              <ShadcnHeader
                homeLinkProps={{ href: homeHref, title: tenantSettings.name }}
                serviceName={tenantSettings.name}
                navigation={<ShadcnDomainNavigation boards={boards} tenantSettings={tenantSettings} />}
                quickAccessItems={
                  <>
                    <UIThemeDevToggle />
                    <ShadcnUserHeaderItem userMenu={userMenu} pendingModerationCount={pendingModerationCount} />
                  </>
                }
                mobileUserMenu={
                  <ShadcnUserHeaderItem
                    userMenu={userMenu}
                    pendingModerationCount={pendingModerationCount}
                    mode="sheet"
                  />
                }
              />
            )}

            {mainContent}

            {theme === "Dsfr" ? (
              <PublicFooter id="footer" />
            ) : (
              <ShadcnFooter id="footer" serviceName={tenantSettings.name} />
            )}
          </MuiDsfrThemeProvider>
        </AppRouterCacheProvider>
      </DsfrProvider>
    </UIProvider>
  );
};

export default DashboardLayout;
