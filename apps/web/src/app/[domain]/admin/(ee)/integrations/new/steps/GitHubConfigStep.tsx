"use client";

import { Hint, Input, Label } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";

import { SYNC_INTERVAL_OPTIONS, useGitHubWizardStore } from "../useGitHubWizardStore";

const NativeSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  />
);

export const GitHubConfigStep = () => {
  const t = useTranslations("domainAdmin.integrations.github.wizard");
  const tWizard = useTranslations("domainAdmin.integrations.wizard");
  const { integrationName, syncDirection, syncIntervalMinutes, setIntegrationName, setSyncDirection, setSyncIntervalMinutes } =
    useGitHubWizardStore();

  return (
    <div>
      <p className="mb-4">{tWizard("configDescription")}</p>

      <div className="mb-4 space-y-2">
        <Label htmlFor="github-integration-name">{tWizard("integrationName")}</Label>
        <Input
          id="github-integration-name"
          value={integrationName}
          onChange={e => setIntegrationName(e.target.value)}
        />
        <Hint>{t("integrationNameHint")}</Hint>
      </div>

      <div className="mb-4 space-y-2">
        <Label htmlFor="github-sync-direction">{tWizard("syncDirection")}</Label>
        <NativeSelect
          id="github-sync-direction"
          value={syncDirection}
          onChange={e => setSyncDirection(e.target.value as typeof syncDirection)}
        >
          <option value="bidirectional">{t("bidirectional")}</option>
          <option value="inbound">{t("inboundOnly")}</option>
          <option value="outbound">{t("outboundOnly")}</option>
        </NativeSelect>
        <Hint>{t("syncDirectionHint")}</Hint>
      </div>

      <div className="space-y-2">
        <Label htmlFor="github-sync-frequency">{tWizard("syncFrequency")}</Label>
        <NativeSelect
          id="github-sync-frequency"
          value={syncIntervalMinutes ?? ""}
          onChange={e => {
            const val = e.target.value;
            setSyncIntervalMinutes(val ? Number(val) : null);
          }}
        >
          {SYNC_INTERVAL_OPTIONS.map(opt => (
            <option key={opt ?? "manual"} value={opt ?? ""}>
              {opt === null
                ? tWizard("manualOnly")
                : opt < 60
                  ? tWizard("everyMinutes", { count: opt })
                  : opt === 60
                    ? tWizard("everyHour")
                    : opt < 1440
                      ? tWizard("everyHours", { count: opt / 60 })
                      : tWizard("everyDay")}
            </option>
          ))}
        </NativeSelect>
        <Hint>{tWizard("syncFrequencyHint")}</Hint>
      </div>
    </div>
  );
};
