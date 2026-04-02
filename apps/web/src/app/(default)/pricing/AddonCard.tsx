"use client";

import { Card } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";

import { type AddonPack } from "@/lib/model/Pricing";

import { usePricingInterval } from "./PricingToggle";

interface AddonCardProps {
  pack: AddonPack;
}

export const AddonCard = ({ pack }: AddonCardProps) => {
  const t = useTranslations("pricing");
  const interval = usePricingInterval();
  const price = interval === "yearly" ? pack.monthlyPrice * 10 : pack.monthlyPrice;
  const suffix = interval === "yearly" ? t("year") : t("month");

  return (
    <Card className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium">{t(`packs.${pack.id}.name` as never)}</p>
        <p className="text-xs text-muted-foreground">{t(`packs.${pack.id}.description` as never)}</p>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-lg font-bold">{price}€</span>
        <span className="text-xs text-muted-foreground">/{suffix}</span>
      </div>
    </Card>
  );
};
