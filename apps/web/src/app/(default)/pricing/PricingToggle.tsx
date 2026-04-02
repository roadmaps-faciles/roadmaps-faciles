"use client";

import { cn } from "@roadmaps-faciles/ui/lib/cn";
import { useTranslations } from "next-intl";
import { createContext, type ReactNode, useContext, useState } from "react";

type BillingInterval = "monthly" | "yearly";

const PricingIntervalContext = createContext<BillingInterval>("monthly");

export const usePricingInterval = () => useContext(PricingIntervalContext);

export const PricingToggle = ({ children }: { children: ReactNode }) => {
  const t = useTranslations("pricing");
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <PricingIntervalContext value={interval}>
      <div className="mb-8 flex items-center justify-center gap-1 rounded-full border bg-card p-1">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            interval === "monthly"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("monthly")}
        </button>
        <button
          type="button"
          onClick={() => setInterval("yearly")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            interval === "yearly"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t("yearly")}
        </button>
      </div>
      {children}
    </PricingIntervalContext>
  );
};
