"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { UIAlert } from "@/ui/bridge/UIAlert";
import { UIButton } from "@/ui/bridge/UIButton";
import { UIInput } from "@/ui/bridge/UIInput";

import { upgradeOrganization } from "./actions";

interface UpgradeFormProps {
  defaultName: string;
  defaultSlug: string;
  orgId: number;
  userId: string;
}

export const UpgradeForm = ({ orgId, defaultName, defaultSlug }: UpgradeFormProps) => {
  const t = useTranslations("upgrade");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<null | string>(null);
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState(defaultSlug);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await upgradeOrganization({ orgId, name, slug });
      if (result.ok) {
        // Redirect to checkout
        window.location.href = result.data.checkoutUrl;
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && <UIAlert variant="destructive" title={t("error")} description={error} />}

      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t("orgDetails")}</h2>
        <p className="text-sm text-muted-foreground">{t("orgDetailsDescription")}</p>

        <UIInput
          label={t("orgName")}
          nativeInputProps={{
            value: name,
            onChange: e => setName(e.target.value),
            required: true,
          }}
        />

        <UIInput
          label={t("orgSlug")}
          hintText={t("orgSlugHint")}
          nativeInputProps={{
            value: slug,
            onChange: e => setSlug(e.target.value),
            required: true,
            pattern: "^[a-z0-9-]+$",
          }}
        />
      </div>

      <div className="rounded-lg border p-6 space-y-3">
        <h2 className="text-lg font-semibold">{t("planDetails")}</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {t("feature.unlimitedTenants")}</li>
          <li>• {t("feature.addons")}</li>
          <li>• {t("feature.billing")}</li>
        </ul>
      </div>

      <UIButton onClick={handleSubmit} disabled={isPending || !name || !slug}>
        {t("proceedToCheckout")}
      </UIButton>
    </div>
  );
};
