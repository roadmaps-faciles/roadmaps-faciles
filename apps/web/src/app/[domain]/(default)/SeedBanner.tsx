"use client";

import { useTranslations } from "next-intl";
import { useCallback, useSyncExternalStore } from "react";

import { UIAlert, UIButton } from "@/ui/bridge";
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
    <UIAlert
      className="mb-8"
      variant="default"
      closable
      onClose={handleClose}
      title={t("seedBannerTitle")}
      description={
        <>
          <p className="mb-2">
            {t("seedBannerDescription", {
              boards: WELCOME_DATA_PREVIEW.boards.length,
              statuses: WELCOME_DATA_PREVIEW.statuses.length,
              extras: WELCOME_DATA_PREVIEW.extras,
            })}
          </p>
          <UIButton variant="secondary" size="sm" linkProps={{ href: "/admin/general#seed" }}>
            {t("seedBannerCta")}
          </UIButton>
        </>
      }
    />
  );
};
