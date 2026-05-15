"use client";

import { Alert, AlertDescription, Button } from "@roadmaps-faciles/ui";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { type Board, type PostStatus } from "@/prisma/client";

import { createIntegration } from "../actions";
import { GitHubConfigStep } from "./steps/GitHubConfigStep";
import { GitHubConnectionStep } from "./steps/GitHubConnectionStep";
import { GitHubMappingStep } from "./steps/GitHubMappingStep";
import { GitHubRepositoryStep } from "./steps/GitHubRepositoryStep";
import { GitHubSourceStep } from "./steps/GitHubSourceStep";
import { useGitHubWizardStore } from "./useGitHubWizardStore";

interface GitHubWizardProps {
  appName: string;
  boards: Board[];
  initialInstallationId?: number;
  statuses: PostStatus[];
}

const STEP_COUNT = 5;

export const GitHubWizard = ({ appName, boards, initialInstallationId, statuses }: GitHubWizardProps) => {
  const t = useTranslations("domainAdmin.integrations");
  const tWizard = useTranslations("domainAdmin.integrations.wizard");
  const router = useRouter();
  const {
    step,
    goNext,
    goPrev,
    buildConfig,
    integrationName,
    syncIntervalMinutes,
    reset,
    connectionStatus,
    selectedRepoId,
    schema,
    sourceType,
    setAppInstallation,
  } = useGitHubWizardStore();

  useEffect(() => {
    reset();
    if (initialInstallationId) {
      setAppInstallation(initialInstallationId, "");
    }
  }, [reset, initialInstallationId, setAppInstallation]);

  const canGoNext = (() => {
    switch (step) {
      case 1:
        return connectionStatus === "success";
      case 2:
        return !!sourceType;
      case 3:
        return !!selectedRepoId && !!schema;
      case 4:
        return true;
      case 5:
        return !!integrationName;
      default:
        return false;
    }
  })();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const stepTitles = [
    tWizard("step1Title"),
    t("github.wizard.sourceTitle"),
    t("github.wizard.repositoryTitle"),
    tWizard("step3Title"),
    tWizard("step4Title"),
  ];

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    const config = buildConfig();
    const result = await createIntegration({
      type: "GITHUB",
      name: integrationName,
      config,
      syncIntervalMinutes: syncIntervalMinutes ?? undefined,
    });

    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    router.push(`/admin/integrations/${result.data.id}`);
  }, [buildConfig, integrationName, syncIntervalMinutes, router]);

  return (
    <div>
      <nav aria-label="progress" className="mb-8">
        <ol className="flex items-center gap-2">
          {stepTitles.map((title, i) => {
            const stepNum = i + 1;
            const isCurrent = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <li key={i} className="flex items-center gap-2">
                <span
                  className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNum}
                </span>
                <span className={`text-sm ${isCurrent ? "font-medium" : "text-muted-foreground"}`}>{title}</span>
                {i < stepTitles.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mb-8">
        {step === 1 && <GitHubConnectionStep appName={appName} />}
        {step === 2 && <GitHubSourceStep />}
        {step === 3 && <GitHubRepositoryStep />}
        {step === 4 && <GitHubMappingStep boards={boards} statuses={statuses} />}
        {step === 5 && <GitHubConfigStep />}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        {step > 1 && (
          <Button variant="outline" onClick={goPrev}>
            <ChevronLeft className="mr-1 size-4" />
            {tWizard("previous")}
          </Button>
        )}
        {step < STEP_COUNT && step !== 3 && (
          <Button onClick={goNext} disabled={!canGoNext}>
            {tWizard("next")}
            <ChevronRight className="ml-1 size-4" />
          </Button>
        )}
        {step === STEP_COUNT && (
          <Button onClick={() => void handleSubmit()} disabled={!canGoNext || submitting}>
            {submitting && <Loader2 className="mr-1 size-4 animate-spin" />}
            {submitting ? tWizard("creating") : tWizard("create")}
          </Button>
        )}
      </div>
    </div>
  );
};
