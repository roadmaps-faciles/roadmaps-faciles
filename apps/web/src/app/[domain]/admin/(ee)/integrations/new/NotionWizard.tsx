"use client";

import { Alert, AlertDescription, Button } from "@roadmaps-faciles/ui";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { type Board, type PostStatus } from "@/prisma/client";

import { createIntegration } from "../actions";
import { ConfigStep } from "./steps/ConfigStep";
import { ConnectionStep } from "./steps/ConnectionStep";
import { DatabaseStep } from "./steps/DatabaseStep";
import { MappingStep } from "./steps/MappingStep";
import { useNotionWizardStore } from "./useNotionWizardStore";

interface NotionWizardProps {
  boards: Board[];
  statuses: PostStatus[];
}

const STEP_COUNT = 4;

export const NotionWizard = ({ boards, statuses }: NotionWizardProps) => {
  const t = useTranslations("domainAdmin.integrations.wizard");
  const router = useRouter();
  const {
    step,
    goNext,
    goPrev,
    buildConfig,
    getUnmappedStatusOptions,
    integrationName,
    syncIntervalMinutes,
    reset,
    connectionStatus,
    selectedDatabaseId,
    schema,
    propertyMapping,
  } = useNotionWizardStore();

  useEffect(() => {
    reset();
  }, [reset]);

  const canGoNext = (() => {
    switch (step) {
      case 1:
        return connectionStatus === "success";
      case 2:
        return !!selectedDatabaseId && !!schema;
      case 3:
        return !!propertyMapping.title;
      case 4:
        return !!integrationName;
      default:
        return false;
    }
  })();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const stepTitles = [t("step1Title"), t("step2Title"), t("step3Title"), t("step4Title")];

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    const config = buildConfig();
    const unmappedStatusOptions = getUnmappedStatusOptions();
    const result = await createIntegration({
      name: integrationName,
      config,
      syncIntervalMinutes: syncIntervalMinutes ?? undefined,
      unmappedStatusOptions: unmappedStatusOptions.length > 0 ? unmappedStatusOptions : undefined,
    });

    if (!result.ok) {
      setSubmitting(false);
      setError(result.error);
      return;
    }

    router.push(`/admin/integrations/${result.data.id}`);
  }, [buildConfig, getUnmappedStatusOptions, integrationName, syncIntervalMinutes, router]);

  return (
    <div>
      {/* Stepper */}
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
        {step === 1 && <ConnectionStep />}
        {step === 2 && <DatabaseStep />}
        {step === 3 && <MappingStep boards={boards} statuses={statuses} />}
        {step === 4 && <ConfigStep />}
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
            {t("previous")}
          </Button>
        )}
        {step < STEP_COUNT && step !== 2 && (
          <Button onClick={goNext} disabled={!canGoNext}>
            {t("next")}
            <ChevronRight className="ml-1 size-4" />
          </Button>
        )}
        {step === STEP_COUNT && (
          <Button onClick={() => void handleSubmit()} disabled={!canGoNext || submitting}>
            {submitting && <Loader2 className="mr-1 size-4 animate-spin" />}
            {submitting ? t("creating") : t("create")}
          </Button>
        )}
      </div>
    </div>
  );
};
