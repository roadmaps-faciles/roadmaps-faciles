"use client";

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { type SubmitEvent, useEffect, useState, useTransition } from "react";

import { type License, type LicenseVerification } from "@/lib/ee/licensing/adminClient";

import {
  getLicenseDetailAdminAction,
  listVerificationsAdminAction,
  renewLicenseAdminAction,
  revokeLicenseAdminAction,
} from "./actions";

interface Props {
  licenseId: null | string;
  onCloseAction: () => void;
  onUpdatedAction: () => void;
}

const formatDate = (iso: null | string) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("fr-FR");
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b py-2 last:border-b-0">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-right text-sm break-all">{value}</span>
  </div>
);

export const LicenseDetailDialog = ({ licenseId, onCloseAction, onUpdatedAction }: Props) => {
  const t = useTranslations("rootAdmin.licensing.management.detail");

  const [license, setLicense] = useState<License | null>(null);
  const [distinctInstances, setDistinctInstances] = useState(0);
  const [verifications, setVerifications] = useState<LicenseVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [renewExpiresAt, setRenewExpiresAt] = useState("");
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!licenseId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on licenseId change before async load
    setLoading(true);
    setLicense(null);
    setVerifications([]);
    setConfirmRevoke(false);

    void (async () => {
      const [detail, verifs] = await Promise.all([
        getLicenseDetailAdminAction(licenseId),
        listVerificationsAdminAction(licenseId),
      ]);
      if (cancelled) return;
      if (detail.ok) {
        setLicense(detail.data.license);
        setDistinctInstances(detail.data.distinctInstances);
        setRenewExpiresAt(new Date(detail.data.license.expiresAt).toISOString().slice(0, 10));
      } else {
        toast.error(detail.error);
      }
      if (verifs.ok) {
        setVerifications(verifs.data.verifications);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [licenseId]);

  const handleRevoke = () => {
    if (!license) return;
    startTransition(async () => {
      const result = await revokeLicenseAdminAction(license.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setLicense(result.data.license);
      setConfirmRevoke(false);
      onUpdatedAction();
    });
  };

  const handleRenew = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!license) return;
    startTransition(async () => {
      const result = await renewLicenseAdminAction(license.id, new Date(renewExpiresAt).toISOString());
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setLicense(result.data.license);
      onUpdatedAction();
    });
  };

  const isStripeManaged = !!license?.stripeSubscriptionId;
  const isRevoked = !!license?.revokedAt;

  return (
    <Dialog open={!!licenseId} onOpenChange={o => !o && onCloseAction()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{license?.email}</DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}

        {license && (
          <>
            <div className="rounded-lg border p-4">
              <Row label={t("id")} value={<code className="text-xs">{license.id}</code>} />
              <Row label="Plan" value={<Badge variant="outline">{license.plan}</Badge>} />
              <Row
                label="Statut"
                value={
                  isRevoked ? (
                    <Badge variant="destructive">Révoquée</Badge>
                  ) : new Date(license.expiresAt) < new Date() ? (
                    <Badge variant="destructive">Expirée</Badge>
                  ) : (
                    <Badge className="bg-green-600 text-white">Active</Badge>
                  )
                }
              />
              <Row label="Expire le" value={formatDate(license.expiresAt)} />
              <Row label={t("createdAt")} value={formatDate(license.createdAt)} />
              <Row label={t("updatedAt")} value={formatDate(license.updatedAt)} />
              {license.revokedAt && <Row label={t("revokedAt")} value={formatDate(license.revokedAt)} />}
              <Row
                label={t("instanceId")}
                value={
                  license.instanceId ? (
                    <code className="text-xs">{license.instanceId}</code>
                  ) : (
                    <span className="text-muted-foreground">{t("instanceIdNone")}</span>
                  )
                }
              />
              {license.stripeCustomerId && (
                <Row
                  label={t("stripeCustomerId")}
                  value={<code className="text-xs">{license.stripeCustomerId}</code>}
                />
              )}
              {license.stripeSubscriptionId && (
                <Row
                  label={t("stripeSubscriptionId")}
                  value={<code className="text-xs">{license.stripeSubscriptionId}</code>}
                />
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t("verifications")}</h3>
                {distinctInstances > 1 && (
                  <Badge variant="destructive">{t("distinctInstancesWarning", { count: distinctInstances })}</Badge>
                )}
              </div>
              {verifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("verificationsNone")}</p>
              ) : (
                <ul className="max-h-40 space-y-1 overflow-auto text-xs">
                  {verifications.map(v => (
                    <li key={v.id} className="flex justify-between gap-2 border-b py-1">
                      <code>{v.instanceId.slice(0, 16)}...</code>
                      <span className="text-muted-foreground">{v.ip}</span>
                      <span>{formatDate(v.verifiedAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isRevoked && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">{t("actions")}</h3>

                {isStripeManaged ? (
                  <Alert>
                    <AlertDescription>{t("renewBlockedStripe")}</AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleRenew} className="flex items-end gap-2">
                    <div className="grid flex-1 gap-1">
                      <Label htmlFor="renew-date">{t("renewLabel")}</Label>
                      <Input
                        id="renew-date"
                        type="date"
                        required
                        value={renewExpiresAt}
                        onChange={e => setRenewExpiresAt(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={pending} variant="outline">
                      {t("renewSubmit")}
                    </Button>
                  </form>
                )}

                {confirmRevoke ? (
                  <Alert variant="destructive">
                    <AlertDescription className="space-y-2">
                      <p>{t("revokeDescription")}</p>
                      <div className="flex gap-2">
                        <Button onClick={handleRevoke} disabled={pending} variant="destructive" size="sm">
                          {t("revokeConfirm")}
                        </Button>
                        <Button onClick={() => setConfirmRevoke(false)} variant="outline" size="sm">
                          Annuler
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button onClick={() => setConfirmRevoke(true)} variant="destructive" size="sm">
                    {t("revoke")}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
