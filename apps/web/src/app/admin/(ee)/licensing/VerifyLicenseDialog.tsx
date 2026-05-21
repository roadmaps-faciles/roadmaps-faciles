"use client";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  toast,
} from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { type SubmitEvent, useState, useTransition } from "react";

import { type VerifyKeyResult, verifyLicenseKeyAction } from "./actions";

interface Props {
  onCloseAction: () => void;
  open: boolean;
}

export const VerifyLicenseDialog = ({ open, onCloseAction }: Props) => {
  const t = useTranslations("rootAdmin.licensing.verify");

  const [key, setKey] = useState("");
  const [instanceId, setInstanceId] = useState("verify-test");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<null | VerifyKeyResult>(null);

  const handleClose = () => {
    setKey("");
    setInstanceId("verify-test");
    setResult(null);
    onCloseAction();
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await verifyLicenseKeyAction(key, instanceId || "verify-test");
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setResult(res.data);
    });
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="verify-key">{t("key")}</Label>
            <Textarea
              id="verify-key"
              rows={3}
              required
              placeholder={t("keyPlaceholder")}
              value={key}
              onChange={e => setKey(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="verify-instance">{t("instanceId")}</Label>
            <Input
              id="verify-instance"
              placeholder={t("instanceIdPlaceholder")}
              value={instanceId}
              onChange={e => setInstanceId(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={pending || !key.trim()}>
            {pending ? t("submitting") : t("submit")}
          </Button>
        </form>

        {result && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">{t("result")}</h3>

            <section className="space-y-2 rounded-md bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{t("offlineTitle")}</p>
              <div className="flex flex-wrap items-center gap-2">
                {result.offline.signatureValid ? (
                  <Badge className="bg-green-600 text-white">{t("signatureValid")}</Badge>
                ) : (
                  <Badge variant="destructive">{t("signatureInvalid")}</Badge>
                )}
                {result.offline.payload ? (
                  <Badge variant="outline">{t("payloadFound")}</Badge>
                ) : (
                  <Badge variant="destructive">{t("payloadInvalid")}</Badge>
                )}
              </div>
              {result.offline.plan && (
                <p className="text-xs">
                  <span className="text-muted-foreground">{t("plan")} :</span> {result.offline.plan}
                </p>
              )}
              {result.offline.expiresAt && (
                <p className="text-xs">
                  <span className="text-muted-foreground">{t("expiresAt")} :</span>{" "}
                  {new Date(result.offline.expiresAt).toLocaleString("fr-FR")}
                </p>
              )}
            </section>

            <section className="space-y-2 rounded-md bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{t("onlineTitle")}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{t("status")} :</span>
                <StatusBadge status={result.online.status} valid={result.online.valid} />
              </div>
              {result.online.plan && (
                <p className="text-xs">
                  <span className="text-muted-foreground">{t("plan")} :</span> {result.online.plan}
                </p>
              )}
              {result.online.expiresAt && (
                <p className="text-xs">
                  <span className="text-muted-foreground">{t("expiresAt")} :</span>{" "}
                  {new Date(result.online.expiresAt).toLocaleString("fr-FR")}
                </p>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const StatusBadge = ({ status, valid }: { status: string; valid: boolean }) => {
  const t = useTranslations("rootAdmin.licensing.verify");

  switch (status) {
    case "active":
      return <Badge className="bg-green-600 text-white">{t("statusActive")}</Badge>;
    case "expired":
      return <Badge variant="destructive">{t("statusExpired")}</Badge>;
    case "revoked":
      return <Badge variant="secondary">{t("statusRevoked")}</Badge>;
    case "invalid":
      return <Badge variant="destructive">{t("statusInvalid")}</Badge>;
    case "unreachable":
      return <Badge variant="outline">{t("statusUnreachable")}</Badge>;
    default:
      return <Badge variant={valid ? "default" : "destructive"}>{status}</Badge>;
  }
};
