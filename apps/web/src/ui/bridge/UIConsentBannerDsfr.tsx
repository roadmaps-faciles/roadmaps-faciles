"use client";

import { useEffect, useRef } from "react";

import { useConsent } from "@/consent";
import { ConsentBannerAndConsentManagement, useConsent as useDsfrConsent } from "@/consentManagement";

const DsfrConsentSync = () => {
  const { finalities, finalityConsent, setConsent } = useConsent();
  const { finalityConsent: dsfrConsent } = useDsfrConsent();
  const skipNextRef = useRef(false);

  useEffect(() => {
    if (!dsfrConsent) return;
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    for (const finality of finalities) {
      const dsfrValue = (dsfrConsent as Record<string, unknown>)[finality];
      if (typeof dsfrValue !== "boolean") continue;
      if (finalityConsent?.[finality] === dsfrValue) continue;
      setConsent(finality, dsfrValue);
    }
  }, [dsfrConsent, finalities, finalityConsent, setConsent]);

  return null;
};

export const UIConsentBannerDsfr = () => {
  const { finalities } = useConsent();
  if (finalities.length === 0) return null;
  return (
    <>
      <ConsentBannerAndConsentManagement />
      <DsfrConsentSync />
    </>
  );
};
