"use client";

import { Button, Label, Switch } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FEATURE_FLAGS, type FeatureFlagKey, type FeatureFlagsMap } from "@/lib/feature-flags/flags";

import { saveFeatureFlags } from "./actions";

interface FeatureFlagsFormProps {
  flags: FeatureFlagsMap;
}

const flagKeys = Object.keys(FEATURE_FLAGS) as FeatureFlagKey[];

export const FeatureFlagsForm = ({ flags }: FeatureFlagsFormProps) => {
  const t = useTranslations("rootAdmin.featureFlags");
  const tc = useTranslations("common");
  const router = useRouter();
  const [localFlags, setLocalFlags] = useState<FeatureFlagsMap>(flags);

  if (flagKeys.length === 0) {
    return <p className="text-muted-foreground">{t("noFlags")}</p>;
  }

  const handleToggle = (key: FeatureFlagKey, checked: boolean) => {
    setLocalFlags(prev => ({ ...prev, [key]: checked }));
  };

  const handleSave = async () => {
    const result = await saveFeatureFlags(localFlags);
    if (!result.ok) {
      console.error(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {flagKeys.map(key => {
        const label = t(`flags.${key}.label` as never);
        const description = t(`flags.${key}.description` as never);
        return (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor={`flag-${key}`}>{label}</Label>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
              id={`flag-${key}`}
              checked={localFlags[key]}
              onCheckedChange={checked => handleToggle(key, checked)}
            />
          </div>
        );
      })}

      <Button onClick={() => void handleSave()}>{tc("save")}</Button>
    </div>
  );
};
