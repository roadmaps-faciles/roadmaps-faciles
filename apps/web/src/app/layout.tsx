import "./tailwind-entry.css";
import "./globals.scss";
import "react-loading-skeleton/dist/skeleton.css";
import * as Sentry from "@sentry/nextjs";
import { type Metadata } from "next";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Suspense } from "react";
import { SkeletonTheme } from "react-loading-skeleton";

import { TechnicalErrorDisplay } from "@/components/Error/TechnicalErrorDisplay";
import { config } from "@/config";
import { ConsentProvider } from "@/consent";
import { IdentifyUser } from "@/lib/ee/tracking-provider/IdentifyUser";
import { TrackingProvider } from "@/lib/ee/tracking-provider/TrackingProvider";
import { getEffectiveFlags, type FeatureFlagsMap } from "@/lib/feature-flags";
import { FeatureFlagProvider } from "@/lib/feature-flags/client";
import { FEATURE_FLAGS } from "@/lib/feature-flags/flags";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/next-auth/auth";
import { UIProvider } from "@/ui";
import { UIConsentBanner } from "@/ui/bridge";
import { SkipLinks } from "@/ui/SkipLinks";
import { isDatabaseUnavailableError } from "@/utils/dbError";

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
  const [lang, messages] = await Promise.all([getLocale(), getMessages()]);

  let session: null | Session = null;
  let effectiveFlags: FeatureFlagsMap = { ...FEATURE_FLAGS };
  let dbError: Error | null = null;

  try {
    session = await auth();
    effectiveFlags = await getEffectiveFlags(session);
  } catch (error) {
    if (error instanceof Error && isDatabaseUnavailableError(error)) {
      logger.error({ err: error }, "RootLayout: database unavailable, rendering 503 fallback");
      Sentry.captureException(error);
      const plain = new Error(error.message);
      plain.name = error.name;
      plain.stack = error.stack;
      dbError = plain;
    } else {
      throw error;
    }
  }

  return (
    <html lang={lang} suppressHydrationWarning data-ui-theme="Default" className={styles.app}>
      <head>
        <ThemeScript />
      </head>
      <body suppressHydrationWarning>
        <SessionProvider refetchOnWindowFocus>
          <NextIntlClientProvider messages={messages}>
            <ConsentProvider>
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
                      <UIConsentBanner />
                      <Suspense>
                        <div className={styles.app}>
                          {dbError ? <TechnicalErrorDisplay error={dbError} /> : children}
                        </div>
                      </Suspense>
                    </UIProvider>
                  </FeatureFlagProvider>
                </SkeletonTheme>
              </TrackingProvider>
            </ConsentProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
