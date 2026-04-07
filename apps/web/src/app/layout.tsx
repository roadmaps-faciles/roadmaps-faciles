import "./tailwind-entry.css";
import "./globals.scss";
import "react-loading-skeleton/dist/skeleton.css";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Suspense } from "react";
import { SkeletonTheme } from "react-loading-skeleton";

import { config } from "@/config";
import { IdentifyUser } from "@/lib/ee/tracking-provider/IdentifyUser";
import { TrackingProvider } from "@/lib/ee/tracking-provider/TrackingProvider";
import { getEffectiveFlags } from "@/lib/feature-flags";
import { FeatureFlagProvider } from "@/lib/feature-flags/client";
import { auth } from "@/lib/next-auth/auth";
import { UIProvider } from "@/ui";
import { SkipLinks } from "@/ui/SkipLinks";

import styles from "./root.module.scss";
import { sharedMetadata } from "./shared-metadata";
import { ThemeScript } from "./ThemeScript";

export const metadata: Metadata = {
  metadataBase: new URL(config.host),
  ...sharedMetadata,
  title: {
    template: `${config.brand.name} - %s`,
    default: config.brand.name,
  },
  openGraph: {
    title: {
      template: `${config.brand.name} - %s`,
      default: config.brand.name,
    },
    ...sharedMetadata.openGraph,
  },
};

const RootLayout = async ({ children }: LayoutProps<"/">) => {
  const [lang, messages, session] = await Promise.all([getLocale(), getMessages(), auth()]);
  const effectiveFlags = await getEffectiveFlags(session);

  return (
    <html lang={lang} suppressHydrationWarning data-ui-theme="Default" className={styles.app}>
      <head>
        <ThemeScript />
      </head>
      <body suppressHydrationWarning>
        <SessionProvider refetchOnWindowFocus>
          <NextIntlClientProvider messages={messages}>
            <TrackingProvider
              providerType={config.tracking.provider}
              posthog={
                config.tracking.provider === "posthog"
                  ? { apiKey: config.tracking.posthogKey, host: config.tracking.posthogHost }
                  : undefined
              }
              matomo={
                config.tracking.provider === "matomo"
                  ? { url: config.matomo.url, siteId: config.matomo.siteId }
                  : undefined
              }
            >
              <IdentifyUser />
              <SkeletonTheme
                baseColor="var(--muted)"
                highlightColor="var(--accent)"
                borderRadius="0.625rem"
                duration={2}
              >
                <SkipLinks />
                <FeatureFlagProvider value={effectiveFlags}>
                  <UIProvider value="Default">
                    <Suspense>
                      <div className={styles.app}>{children}</div>
                    </Suspense>
                  </UIProvider>
                </FeatureFlagProvider>
              </SkeletonTheme>
            </TrackingProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
