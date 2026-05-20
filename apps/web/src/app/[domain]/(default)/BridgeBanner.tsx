"use client";

import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

import { UINotice } from "@/ui/bridge";

interface BridgeBannerProps {
  brandName: string;
  rootUrl: string;
  tenantName: string;
}

const DISMISS_KEY = "bridge_banner_dismissed";
const DISMISS_EVENT = "bridge-banner-dismissed";

const subscribeDismiss = (cb: () => void) => {
  window.addEventListener(DISMISS_EVENT, cb);
  return () => window.removeEventListener(DISMISS_EVENT, cb);
};

const useDismissedFromStorage = () =>
  useSyncExternalStore(
    subscribeDismiss,
    () => window.sessionStorage.getItem(DISMISS_KEY) === "1",
    () => true,
  );

const useFromRoot = () =>
  useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("from") === "root",
    () => false,
  );

export const BridgeBanner = ({ rootUrl, brandName, tenantName }: BridgeBannerProps) => {
  const t = useTranslations("auth");
  const dismissed = useDismissedFromStorage();
  const fromRoot = useFromRoot();
  const [locallyDismissed, setLocallyDismissed] = useState(false);

  if (dismissed || locallyDismissed) return null;

  const handleDismiss = () => {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
    window.dispatchEvent(new Event(DISMISS_EVENT));
    setLocallyDismissed(true);
  };

  const currentUrl = window.location.href;
  const params = new URLSearchParams({ redirect: currentUrl });
  if (fromRoot) params.set("action", "signup");
  const ctaHref = `${rootUrl}/api/auth-bridge?${params.toString()}`;

  const message = fromRoot
    ? t("bridgeBannerOutsider", { brand: brandName, tenantName })
    : t("bridgeBannerDefault", { brand: brandName });
  const ctaLabel = fromRoot
    ? t("bridgeBannerOutsiderCta", { tenantName })
    : t("bridgeBannerDefaultCta", { brand: brandName });

  return (
    <UINotice
      severity="info"
      title={message}
      link={{ href: ctaHref, text: ctaLabel }}
      closable
      onClose={handleDismiss}
    />
  );
};
