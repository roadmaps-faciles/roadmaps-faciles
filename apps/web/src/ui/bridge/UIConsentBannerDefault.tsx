"use client";

import { Button as ShadcnButton, Switch as ShadcnSwitch } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useId, useState } from "react";

import { type Finality, type FinalityConsent, useConsent } from "@/consent";

import { UIModal } from "./UIModal";

const seedDraft = (
  finalities: readonly Finality[],
  finalityConsent: FinalityConsent | undefined,
): Record<Finality, boolean> => {
  const seed = {} as Record<Finality, boolean>;
  for (const f of finalities) seed[f] = finalityConsent?.[f] ?? false;
  return seed;
};

interface ConsentManagementFormProps {
  finalities: readonly Finality[];
  finalityConsent: FinalityConsent | undefined;
  onClose: () => void;
  open: boolean;
  setConsent: (finality: Finality, value: boolean) => void;
}

const ConsentManagementForm = ({
  finalities,
  finalityConsent,
  onClose,
  open,
  setConsent,
}: ConsentManagementFormProps) => {
  const t = useTranslations("consent");
  const tFin = useTranslations("consent.finalities");
  const [draft, setDraft] = useState<Record<Finality, boolean>>(() => seedDraft(finalities, finalityConsent));

  const handleSave = () => {
    for (const f of finalities) setConsent(f, draft[f]);
    onClose();
  };

  return (
    <UIModal
      open={open}
      onClose={onClose}
      title={t("management.title")}
      footer={
        <>
          <ShadcnButton variant="ghost" size="sm" onClick={onClose}>
            {t("management.back")}
          </ShadcnButton>
          <ShadcnButton variant="default" size="sm" onClick={handleSave}>
            {t("management.save")}
          </ShadcnButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("management.description")}</p>
        <div className="flex flex-col gap-3">
          {finalities.map(finality => {
            const fieldId = `consent-finality-${finality}`;
            return (
              <div key={finality} className="flex items-start gap-3 rounded-md border border-border p-3">
                <ShadcnSwitch
                  id={fieldId}
                  checked={draft[finality] ?? false}
                  onCheckedChange={value => setDraft(d => ({ ...d, [finality]: value }))}
                />
                <label htmlFor={fieldId} className="flex flex-col gap-1 text-sm">
                  <span className="font-medium">{tFin(`${finality}.title`)}</span>
                  <span className="text-muted-foreground">{tFin(`${finality}.description`)}</span>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </UIModal>
  );
};

export const UIConsentBannerDefault = () => {
  const t = useTranslations("consent");
  const {
    finalities,
    finalityConsent,
    hasDecided,
    isManagementOpen,
    acceptAll,
    declineAll,
    openManagement,
    closeManagement,
    setConsent,
  } = useConsent();

  const titleId = useId();

  if (finalities.length === 0) return null;

  return (
    <>
      {!hasDecided && (
        <div
          aria-label={t("banner.ariaLabel")}
          aria-describedby={titleId}
          role="dialog"
          className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-primary/40 bg-muted/95 text-foreground p-4 shadow-[0_-16px_40px_-8px_rgba(0,0,0,0.25),0_-4px_12px_-2px_rgba(0,0,0,0.1)] backdrop-blur-md md:p-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            <h2 id={titleId} className="text-lg font-semibold">
              {t("banner.title")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("banner.description")}</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <ShadcnButton variant="ghost" size="sm" onClick={openManagement}>
                {t("banner.customize")}
              </ShadcnButton>
              <ShadcnButton variant="outline" size="sm" onClick={declineAll}>
                {t("banner.declineAll")}
              </ShadcnButton>
              <ShadcnButton variant="default" size="sm" onClick={acceptAll}>
                {t("banner.acceptAll")}
              </ShadcnButton>
            </div>
            <Link href="/politique-de-confidentialite#cookies" className="text-xs text-muted-foreground underline">
              {t("footer.policy")}
            </Link>
          </div>
        </div>
      )}

      {isManagementOpen && (
        <ConsentManagementForm
          finalities={finalities}
          finalityConsent={finalityConsent}
          onClose={closeManagement}
          open={isManagementOpen}
          setConsent={setConsent}
        />
      )}
    </>
  );
};
