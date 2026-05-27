"use client";

import { useTranslations } from "next-intl";
import { useCallback, useSyncExternalStore } from "react";

import { UINotice } from "@/ui/bridge";
import { WELCOME_DATA_PREVIEW } from "@/workflows/welcomeDataPreview";

const STORAGE_KEY_PREFIX = "seed-banner-dismissed-";

interface SeedBannerProps {
  tenantId: number;
}

export const SeedBanner = ({ tenantId }: SeedBannerProps) => {
  const t = useTranslations("domainAdmin.general");
  const storageKey = `${STORAGE_KEY_PREFIX}${tenantId}`;

  const subscribe = useCallback(
    (callback: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === storageKey) callback();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [storageKey],
  );

  const getSnapshot = useCallback(() => localStorage.getItem(storageKey) === "true", [storageKey]);
  const getServerSnapshot = useCallback(() => true, []);

  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (dismissed) return null;

  const handleClose = () => {
    localStorage.setItem(storageKey, "true");
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
  };

  return (
    <UINotice
      className="mb-8"
      severity="info"
      title={t("seedBannerTitle")}
      description={t("seedBannerDescription", {
        boards: WELCOME_DATA_PREVIEW.boards.length,
        statuses: WELCOME_DATA_PREVIEW.statuses.length,
        extras: WELCOME_DATA_PREVIEW.extras,
      })}
      link={{ href: "/admin/general#seed", text: t("seedBannerCta") }}
      closable
      onClose={handleClose}
    />
  );
};
