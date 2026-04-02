"use client";

import { Hint, Input, Label } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";

import { SYNC_INTERVAL_OPTIONS, useNotionWizardStore } from "../useNotionWizardStore";

export const ConfigStep = () => {
  const t = useTranslations("domainAdmin.integrations.wizard");
  const { integrationName, syncIntervalMinutes, setIntegrationName, setSyncIntervalMinutes } = useNotionWizardStore();

  return (
    <div>
      <p className="mb-4">{t("configDescription")}</p>

      <div className="mb-4 space-y-2">
        <Label htmlFor="integration-name">{t("integrationName")}</Label>
        <Input id="integration-name" value={integrationName} onChange={e => setIntegrationName(e.target.value)} />
        <Hint>{t("integrationNameHint")}</Hint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sync-frequency">{t("syncFrequency")}</Label>
        <select
          id="sync-frequency"
          value={syncIntervalMinutes ?? ""}
          onChange={e => {
            const val = e.target.value;
            setSyncIntervalMinutes(val ? Number(val) : null);
          }}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {SYNC_INTERVAL_OPTIONS.map(opt => (
            <option key={opt ?? "manual"} value={opt ?? ""}>
              {opt === null
                ? t("manualOnly")
                : opt < 60
                  ? t("everyMinutes", { count: opt })
                  : opt === 60
                    ? t("everyHour")
                    : opt < 1440
                      ? t("everyHours", { count: opt / 60 })
                      : t("everyDay")}
            </option>
          ))}
        </select>
        <Hint>{t("syncFrequencyHint")}</Hint>
      </div>
    </div>
  );
};
