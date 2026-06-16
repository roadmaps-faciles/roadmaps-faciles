import { Check } from "lucide-react";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { sharedMetadata } from "@/app/shared-metadata";
import { config } from "@/config";
import { isSelfHost } from "@/lib/deployment";
import { ADDON_PACKS, BASE_FEATURES } from "@/lib/model/Pricing";
import { auth } from "@/lib/next-auth/auth";

import { AddonCard } from "./AddonCard";
import { BundleCards } from "./BundleCards";
import { GouvCallout } from "./GouvCallout";
import { PricingToggle } from "./PricingToggle";

const title = "Tarifs";
const description = "Des tarifs simples et transparents pour tous les besoins.";
const url = "/pricing";

export const metadata: Metadata = {
  ...sharedMetadata,
  title,
  description,
  openGraph: {
    ...sharedMetadata.openGraph,
    title,
    description,
    url,
  },
  alternates: {
    canonical: url,
  },
};

const PricingPage = async () => {
  await connection();
  if (await isSelfHost()) notFound();
  const [t, session] = await Promise.all([getTranslations("pricing"), auth()]);
  const ctaHref = session ? "/workspaces" : "/signup";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-base text-muted-foreground sm:mt-4 sm:text-lg">{t("subtitle")}</p>
      </div>

      {/* Base features - free */}
      <section className="mb-16">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold sm:text-2xl">{t("baseTitle")}</h2>
          <p className="mt-1 text-muted-foreground">{t("baseSubtitle")}</p>
          <p className="mt-3 text-3xl font-bold">{t("free")}</p>
        </div>

        <div className="mx-auto grid max-w-2xl gap-2 sm:grid-cols-2 md:grid-cols-3">
          {BASE_FEATURES.map(feature => (
            <div key={feature} className="flex items-center gap-2.5 rounded-lg border bg-card px-4 py-3 text-sm">
              <Check className="size-4 shrink-0 text-primary" />
              <span>{t(`features.${feature}`)}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={ctaHref}
            className="inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("cta.login")}
          </Link>
        </div>
      </section>

      {/* Toggle + Addons + Bundles - wrapped in client context */}
      <PricingToggle>
        {/* Addons à la carte */}
        <section className="mb-16">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold sm:text-2xl">{t("addonsTitle")}</h2>
            <p className="mt-1 text-muted-foreground">{t("addonsSubtitle")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ADDON_PACKS.map(pack => (
              <AddonCard key={pack.id} pack={pack} />
            ))}
          </div>
        </section>

        {/* Bundles */}
        <section className="mb-16">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold sm:text-2xl">{t("bundleTitle")}</h2>
            <p className="mt-1 text-muted-foreground">{t("bundleSubtitle")}</p>
          </div>

          <BundleCards ctaHref={ctaHref} />
        </section>
      </PricingToggle>

      {/* Gouv callout */}
      <GouvCallout contactEmail={config.legal.contactEmail} />

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">{t("footer.openSource")}</p>
      </div>
    </div>
  );
};

export default PricingPage;
