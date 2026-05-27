"use client";

import { Badge, Button, Switch, toast } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { VerifyLicenseDialog } from "../(ee)/licensing/VerifyLicenseDialog";
import {
  clearDevLicenseOverrideAction,
  forceExpireDevAction,
  issueAndBindDevAction,
  toggleOfflineDevAction,
} from "./actions";

interface Props {
  hasEnvKey: boolean;
  hasOverride: boolean;
  initialOffline: boolean;
  instanceId: string;
}

export const LicensingDevSection = ({ hasOverride, hasEnvKey, instanceId, initialOffline }: Props) => {
  const t = useTranslations("rootAdmin.devTools.licensing");
  const tVerify = useTranslations("rootAdmin.licensing.verify");
  const [pending, startTransition] = useTransition();
  const [offline, setOffline] = useState(initialOffline);
  const [lastIssuedKey, setLastIssuedKey] = useState<null | string>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const reloadAfter = (action: () => Promise<void>) =>
    startTransition(async () => {
      await action();
      window.location.reload();
    });

  const handleIssueAndBind = () =>
    startTransition(async () => {
      const result = await issueAndBindDevAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setLastIssuedKey(result.data.licenseKey);
      toast.success(t("issuedSuccess"));
    });

  const handleClear = () =>
    reloadAfter(async () => {
      const result = await clearDevLicenseOverrideAction();
      if (!result.ok) toast.error(result.error);
    });

  const handleForceExpire = () =>
    reloadAfter(async () => {
      const result = await forceExpireDevAction();
      if (!result.ok) {
        toast.error(result.error === "no-license" ? t("noLicenseToExpire") : result.error);
        return;
      }
      toast.success(t("expireSuccess"));
    });

  const handleToggleOffline = (value: boolean) => {
    setOffline(value);
    startTransition(async () => {
      const result = await toggleOfflineDevAction(value);
      if (!result.ok) toast.error(result.error);
    });
  };

  const currentSource = hasOverride
    ? t("currentLicenseKeyOverride")
    : hasEnvKey
      ? t("currentLicenseKeyEnv")
      : t("currentLicenseKeyNone");

  return (
    <section className="space-y-4 rounded-lg border p-6">
      <header>
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </header>

      <div className="grid gap-3 rounded-md bg-muted/30 p-4 text-sm sm:grid-cols-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{t("currentLicenseKey")}</span>
          <Badge variant={hasOverride ? "default" : "outline"}>{currentSource}</Badge>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">{t("instanceId")}</span>
          <code className="text-xs">{instanceId.slice(0, 16)}...</code>
        </div>
      </div>

      {lastIssuedKey && (
        <div className="rounded-md border border-orange-500/30 bg-orange-500/5 p-3 text-xs">
          <p className="mb-1 font-medium">Clé émise (override actif) :</p>
          <code className="break-all">{lastIssuedKey}</code>
        </div>
      )}

      <div className="space-y-3">
        <DevAction
          label={tVerify("button")}
          description={tVerify("description")}
          onClick={() => setVerifyOpen(true)}
          pending={false}
          variant="outline"
        />

        <DevAction
          label={t("issueAndBind")}
          description={t("issueAndBindDescription")}
          onClick={handleIssueAndBind}
          pending={pending}
        />

        {hasOverride && (
          <DevAction
            label={t("clearOverride")}
            description={t("clearOverrideDescription")}
            onClick={handleClear}
            pending={pending}
            variant="destructive"
          />
        )}

        <DevAction
          label={t("forceExpire")}
          description={t("forceExpireDescription")}
          onClick={handleForceExpire}
          pending={pending}
          variant="outline"
        />

        <div className="flex items-start justify-between gap-3 rounded-md border p-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{t("toggleOfflineLabel")}</p>
            <p className="text-xs text-muted-foreground">{t("toggleOfflineDescription")}</p>
          </div>
          <Switch checked={offline} onCheckedChange={handleToggleOffline} disabled={pending} />
        </div>
      </div>

      <VerifyLicenseDialog open={verifyOpen} onCloseAction={() => setVerifyOpen(false)} />
    </section>
  );
};

interface DevActionProps {
  description: string;
  label: string;
  onClick: () => void;
  pending: boolean;
  variant?: "default" | "destructive" | "outline";
}

const DevAction = ({ label, description, onClick, pending, variant = "default" }: DevActionProps) => (
  <div className="flex items-start justify-between gap-3 rounded-md border p-3">
    <div className="space-y-0.5">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Button onClick={onClick} disabled={pending} variant={variant} size="sm">
      {label}
    </Button>
  </div>
);
