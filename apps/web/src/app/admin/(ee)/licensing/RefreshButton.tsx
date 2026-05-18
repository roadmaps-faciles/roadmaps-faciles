"use client";

import { Button } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { refreshLicenseAction } from "./actions";

export const RefreshButton = () => {
  const t = useTranslations("rootAdmin.licensing");
  const [isPending, startTransition] = useTransition();

  const handleClickAction = () => {
    startTransition(async () => {
      await refreshLicenseAction();
    });
  };

  return (
    <Button disabled={isPending} onClick={handleClickAction} size="sm" variant="outline">
      {isPending ? t("refreshing") : t("refreshNow")}
    </Button>
  );
};
