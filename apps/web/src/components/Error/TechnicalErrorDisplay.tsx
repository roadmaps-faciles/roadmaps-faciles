"use client";

import { Button } from "@roadmaps-faciles/ui";
import { AlertTriangle, ServerCrash } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { isDatabaseUnavailableError } from "@/utils/dbError";

const isDev = process.env.NODE_ENV === "development";

interface TechnicalErrorDisplayProps {
  error: Error;
  reset?: () => void;
}

export function TechnicalErrorDisplay({ error, reset }: TechnicalErrorDisplayProps) {
  const t = useTranslations("errors");
  const isDbDown = isDatabaseUnavailableError(error);
  const handleRetry = reset ?? (() => window.location.reload());

  if (isDbDown) {
    return (
      <div className="mx-auto max-w-4xl px-4">
        <div className="my-16 flex flex-col items-center gap-8 md:my-24 md:flex-row md:gap-12">
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{t("503.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("errorCode", { code: 503 })}</p>
            <p className="text-lg text-muted-foreground">{t("503.headline")}</p>
            <p className="text-sm text-muted-foreground">{t("503.body")}</p>
            {isDev && <DevErrorDetails error={error} />}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleRetry}>
                {t("retry")}
              </Button>
              <Button asChild>
                <Link href="/">{t("homepage")}</Link>
              </Button>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-center">
            <div className="flex size-32 items-center justify-center rounded-full bg-orange-100 md:size-40 dark:bg-orange-950">
              <ServerCrash className="size-16 text-orange-600 md:size-20 dark:text-orange-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="my-16 flex flex-col items-center gap-8 md:my-24 md:flex-row md:gap-12">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{t("technicalError")}</h1>
          <p className="text-lg text-muted-foreground">{error.name}</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleRetry}>
              {t("retry")}
            </Button>
            <Button asChild>
              <Link href="/">{t("homepage")}</Link>
            </Button>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-center">
          <div className="flex size-32 items-center justify-center rounded-full bg-red-100 md:size-40 dark:bg-red-950">
            <AlertTriangle className="size-16 text-red-600 md:size-20 dark:text-red-400" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DevErrorDetails({ error }: { error: Error }) {
  return (
    <details className="mt-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-xs dark:border-orange-900 dark:bg-orange-950/30">
      <summary className="cursor-pointer font-mono font-semibold">
        [dev] {error.name}: {error.message}
      </summary>
      {error.stack && (
        <pre className="mt-2 max-h-96 overflow-auto font-mono text-[11px] whitespace-pre-wrap text-muted-foreground">
          {error.stack}
        </pre>
      )}
    </details>
  );
}
