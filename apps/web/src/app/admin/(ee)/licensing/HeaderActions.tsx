"use client";

import { Button } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { RefreshButton } from "./RefreshButton";
import { VerifyLicenseDialog } from "./VerifyLicenseDialog";

interface Props {
  showRefresh: boolean;
}

export const HeaderActions = ({ showRefresh }: Props) => {
  const t = useTranslations("rootAdmin.licensing.verify");
  const [verifyOpen, setVerifyOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setVerifyOpen(true)}>
        {t("button")}
      </Button>
      {showRefresh && <RefreshButton />}
      <VerifyLicenseDialog open={verifyOpen} onCloseAction={() => setVerifyOpen(false)} />
    </div>
  );
};
