"use client";

import { Switch, toast } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { toggleStripeCheckoutDevAction } from "./actions";

interface Props {
  initialUseStripe: boolean;
}

export const StripeDevSection = ({ initialUseStripe }: Props) => {
  const t = useTranslations("rootAdmin.devTools.stripe");
  const [useStripe, setUseStripe] = useState(initialUseStripe);
  const [pending, startTransition] = useTransition();

  const handleToggle = (value: boolean) => {
    setUseStripe(value);
    startTransition(async () => {
      const result = await toggleStripeCheckoutDevAction(value);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      window.location.reload();
    });
  };

  return (
    <section className="space-y-4 rounded-lg border p-6">
      <header>
        <h2 className="text-lg font-semibold">{t("title")}</h2>
      </header>

      <div className="flex items-start justify-between gap-3 rounded-md border p-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{t("useStripeLabel")}</p>
          <p className="text-xs text-muted-foreground">{t("useStripeDescription")}</p>
        </div>
        <Switch checked={useStripe} onCheckedChange={handleToggle} disabled={pending} />
      </div>
    </section>
  );
};
