"use client";

import { Card, CardContent, CardHeader, CardTitle, Label, Switch } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";

import { type GitHubSourceType } from "@/lib/ee/integration-provider/types";

import { useGitHubWizardStore } from "../useGitHubWizardStore";

const SOURCE_OPTIONS: Array<{ disabled: boolean; type: GitHubSourceType }> = [
  { type: "issues", disabled: false },
  { type: "discussions", disabled: true },
  { type: "project", disabled: true },
];

export const GitHubSourceStep = () => {
  const t = useTranslations("domainAdmin.integrations.github.wizard");
  const { sourceType, includePullRequests, setSourceType, setIncludePullRequests } = useGitHubWizardStore();

  return (
    <div>
      <p className="mb-4">{t("sourceDescription")}</p>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {SOURCE_OPTIONS.map(({ type, disabled }) => {
          const isSelected = sourceType === type && !disabled;
          return (
            <Card
              key={type}
              className={`transition-colors ${
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : `cursor-pointer hover:bg-accent ${isSelected ? "ring-2 ring-primary" : ""}`
              }`}
              onClick={() => {
                if (!disabled) setSourceType(type);
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {t(`source_${type}`)}
                  {disabled && <span className="ml-2 text-xs font-normal text-muted-foreground">{t("comingSoon")}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t(`source_${type}_description`)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sourceType === "issues" && (
        <div className="flex items-center gap-3">
          <Switch
            id="include-prs"
            checked={includePullRequests}
            onCheckedChange={setIncludePullRequests}
          />
          <Label htmlFor="include-prs">{t("includePullRequests")}</Label>
        </div>
      )}
    </div>
  );
};
