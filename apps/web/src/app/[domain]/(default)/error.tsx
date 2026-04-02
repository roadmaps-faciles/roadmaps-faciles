"use client";

import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Button } from "@roadmaps-faciles/ui";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

import { useUI } from "@/ui";
import { clientParseError } from "@/utils/error";

export default function TenantError({ error: _error, reset }: { error: Error; reset: () => void }) {
  const error = clientParseError(_error);
  const theme = useUI();

  useEffect(() => {
    Sentry.captureException(_error);
  }, [_error]);
  const t = useTranslations("errors");

  if (theme === "Dsfr") {
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
                {
                  children: t("retry"),
                  priority: "secondary",
                  onClick: () => reset(),
                },
                {
                  children: t("homepage"),
                  linkProps: { href: "/" },
                },
              ]}
            />
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
            <Button variant="outline" onClick={() => reset()}>
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
