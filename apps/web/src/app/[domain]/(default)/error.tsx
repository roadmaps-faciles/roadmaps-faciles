"use client";

import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { TechnicalErrorDisplay } from "@/components/Error/TechnicalErrorDisplay";
import { useUI } from "@/ui";
import { isDatabaseUnavailableError } from "@/utils/dbError";
import { clientParseError } from "@/utils/error";

const isDev = process.env.NODE_ENV === "development";

export default function TenantError({ error: _error, reset }: { error: Error; reset: () => void }) {
  const error = clientParseError(_error);
  const theme = useUI();
  const isDbDown = isDatabaseUnavailableError(error);
  const t = useTranslations("errors");

  useEffect(() => {
    Sentry.captureException(_error);
  }, [_error]);

  if (theme !== "Dsfr") return <TechnicalErrorDisplay error={error} reset={reset} />;

  if (isDbDown) {
    return (
      <div className={fr.cx("fr-container", "fr-my-10w")}>
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center")}>
          <div className={fr.cx("fr-col-12", "fr-col-md-8", "fr-col-lg-6")}>
            <h1>{t("503.title")}</h1>
            <p className={fr.cx("fr-text--sm")}>{t("errorCode", { code: 503 })}</p>
            <p className={fr.cx("fr-text--lg")}>{t("503.headline")}</p>
            <p className={fr.cx("fr-text--sm")}>{t("503.body")}</p>
            {isDev && <DevErrorDetails error={error} />}
            <ButtonsGroup
              className={fr.cx("fr-mt-4w")}
              inlineLayoutWhen="md and up"
              buttons={[
                { children: t("retry"), priority: "secondary", onClick: () => reset() },
                { children: t("homepage"), linkProps: { href: "/" } },
              ]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={fr.cx("fr-container", "fr-my-10w")}>
      <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--center")}>
        <div className={fr.cx("fr-col-12", "fr-col-md-8", "fr-col-lg-6")}>
          <h1>{t("technicalError")}</h1>
          <p className={fr.cx("fr-text--lg")}>{error.name}</p>
          <p className={fr.cx("fr-text--sm")}>{error.message}</p>
          <ButtonsGroup
            className={fr.cx("fr-mt-4w")}
            inlineLayoutWhen="md and up"
            buttons={[
              { children: t("retry"), priority: "secondary", onClick: () => reset() },
              { children: t("homepage"), linkProps: { href: "/" } },
            ]}
          />
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
        <pre className="mt-2 max-h-96 overflow-auto font-mono text-[11px] whitespace-pre-wrap">{error.stack}</pre>
      )}
    </details>
  );
}
