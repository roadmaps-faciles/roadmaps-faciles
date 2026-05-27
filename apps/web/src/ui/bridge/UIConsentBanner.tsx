"use client";

import { lazy, Suspense, useEffect, useId } from "react";

import { useConsent } from "@/consent";
import { useUI } from "@/ui";

import { UIConsentBannerDefault } from "./UIConsentBannerDefault";

const UIConsentBannerDsfr = lazy(() => import("./UIConsentBannerDsfr").then(m => ({ default: m.UIConsentBannerDsfr })));

export const UIConsentBanner = () => {
  const theme = useUI();
  const { activeBannerSlotId, registerBannerSlot, unregisterBannerSlot } = useConsent();
  const slotId = useId();

  useEffect(() => {
    registerBannerSlot(slotId);
    return () => unregisterBannerSlot(slotId);
  }, [registerBannerSlot, slotId, unregisterBannerSlot]);

  if (activeBannerSlotId !== null && activeBannerSlotId !== slotId) return null;

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIConsentBannerDsfr />
      </Suspense>
    );
  }

  return <UIConsentBannerDefault />;
};
