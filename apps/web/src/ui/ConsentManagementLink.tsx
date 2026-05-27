"use client";

import { cn } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";

import { useConsent } from "@/consent";

export interface ConsentManagementLinkProps {
  className?: string;
}

export const ConsentManagementLink = ({ className }: ConsentManagementLinkProps) => {
  const t = useTranslations("consent.footer");
  const { finalities, openManagement } = useConsent();

  if (finalities.length === 0) return null;

  return (
    <button
      type="button"
      onClick={openManagement}
      className={cn(
        "rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {t("manage")}
    </button>
  );
};
