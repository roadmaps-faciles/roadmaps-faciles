"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { type SubmitEvent, useState, useTransition } from "react";

import { type CreateLicenseResult, type LicensePlan } from "@/lib/ee/licensing/adminClient";

import { createLicenseAdminAction } from "./actions";

interface Props {
  onCloseAction: () => void;
  onCreatedAction: () => void;
  open: boolean;
}

const oneYearFromNow = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

export const CreateLicenseDialog = ({ open, onCloseAction, onCreatedAction }: Props) => {
  const t = useTranslations("rootAdmin.licensing.management");

  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<LicensePlan>("GOV_LICENSED");
  const [expiresAt, setExpiresAt] = useState(oneYearFromNow);
  const [pending, startTransition] = useTransition();
  const [created, setCreated] = useState<CreateLicenseResult | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setEmail("");
    setPlan("GOV_LICENSED");
    setExpiresAt(oneYearFromNow());
    setCreated(null);
    setCopied(false);
  };

  const handleClose = () => {
    if (created) {
      onCreatedAction();
    }
    reset();
    onCloseAction();
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await createLicenseAdminAction({
        email,
        plan,
        expiresAt: new Date(expiresAt).toISOString(),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setCreated(result.data);
    });
  };

  const handleCopy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="max-w-xl">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("keyReveal.title")}</DialogTitle>
              <DialogDescription>
                {t("keyReveal.issuedFor", { email })} · {t("keyReveal.expiresOn", { date: expiresAt })}
              </DialogDescription>
            </DialogHeader>

            <Alert variant="destructive">
              <AlertTitle>{t("keyReveal.warning")}</AlertTitle>
              <AlertDescription>
                <pre className="mt-2 max-h-48 overflow-auto rounded-sm bg-muted p-3 text-xs break-all whitespace-pre-wrap">
                  {created.licenseKey}
                </pre>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={() => void handleCopy()} variant="outline">
                {copied ? t("keyReveal.copied") : t("keyReveal.copy")}
              </Button>
              <Button onClick={handleClose}>{t("keyReveal.close")}</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t("create.title")}</DialogTitle>
              <DialogDescription>{t("create.description")}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="license-email">{t("create.email")}</Label>
                <Input
                  id="license-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="license-plan">{t("create.plan")}</Label>
                <Select value={plan} onValueChange={v => setPlan(v as LicensePlan)}>
                  <SelectTrigger id="license-plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOV_LICENSED">GOV_LICENSED</SelectItem>
                    <SelectItem value="LICENSED">LICENSED</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t(`create.planHint.${plan}`)}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="license-expiry">{t("create.expiresAt")}</Label>
                <Input
                  id="license-expiry"
                  type="date"
                  required
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? t("create.submitting") : t("create.submit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
