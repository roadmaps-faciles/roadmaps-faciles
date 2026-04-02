"use client";

import { Badge, Card } from "@roadmaps-faciles/ui";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { ADDON_PACKS, BUNDLE_COMPLETE, BUNDLE_PRO } from "@/lib/model/Pricing";

import { usePricingInterval } from "./PricingToggle";

export const BundleCards = ({ ctaHref = "/signup" }: { ctaHref?: string }) => {
  const t = useTranslations("pricing");
  const interval = usePricingInterval();

  const noSsoPacks = ADDON_PACKS.filter(p => BUNDLE_PRO.packs.includes(p.id));
  const noSsoIndividual =
    interval === "yearly"
      ? noSsoPacks.reduce((s, p) => s + p.monthlyPrice * 10, 0)
      : noSsoPacks.reduce((s, p) => s + p.monthlyPrice, 0);
  const allIndividual =
    interval === "yearly"
      ? ADDON_PACKS.reduce((s, p) => s + p.monthlyPrice * 10, 0)
      : ADDON_PACKS.reduce((s, p) => s + p.monthlyPrice, 0);

  const proPrice = interval === "yearly" ? 429 : BUNDLE_PRO.monthlyPrice;
  const completePrice = interval === "yearly" ? 539 : BUNDLE_COMPLETE.monthlyPrice;
  const suffix = interval === "yearly" ? t("year") : t("month");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Pack Pro */}
      <Card className="relative flex flex-col p-6">
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{t("popular")}</Badge>
        <h3 className="text-lg font-bold">{t("bundleNoSso.name")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("bundleNoSso.description")}</p>
        <div className="mt-4">
          <span className="text-3xl font-bold">{proPrice}€</span>
          <span className="text-muted-foreground">/{suffix}</span>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("bundleSavingAmount", { saved: noSsoIndividual - proPrice })}
          </p>
        </div>
        <ul className="mt-4 flex-1 space-y-1.5">
          {noSsoPacks.map(pack => (
            <li key={pack.id} className="flex items-center gap-2 text-sm">
              <Check className="size-3.5 shrink-0 text-primary" />
              {t(`packs.${pack.id}.name` as never)}
            </li>
          ))}
        </ul>
        <Link
          href={ctaHref}
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("cta.subscribe")}
        </Link>
      </Card>

      {/* Pack Complet */}
      <Card className="flex flex-col border-primary p-6 shadow-lg ring-1 ring-primary">
        <h3 className="text-lg font-bold">{t("bundleAll.name")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("bundleAll.description")}</p>
        <div className="mt-4">
          <span className="text-3xl font-bold">{completePrice}€</span>
          <span className="text-muted-foreground">/{suffix}</span>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("bundleSavingAmount", { saved: allIndividual - completePrice })}
          </p>
        </div>
        <ul className="mt-4 flex-1 space-y-1.5">
          {ADDON_PACKS.map(pack => (
            <li key={pack.id} className="flex items-center gap-2 text-sm">
              <Check className="size-3.5 shrink-0 text-primary" />
              {t(`packs.${pack.id}.name` as never)}
            </li>
          ))}
        </ul>
        <Link
          href={ctaHref}
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("cta.subscribe")}
        </Link>
      </Card>
    </div>
  );
};
