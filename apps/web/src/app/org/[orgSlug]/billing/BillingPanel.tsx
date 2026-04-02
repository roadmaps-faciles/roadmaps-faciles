"use client";

import { RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { formatPrice } from "@/lib/ee/billing/format";
import { type BillingInvoice } from "@/lib/ee/billing/invoices";
import { type SubscriptionDetail } from "@/lib/ee/billing/subscription-details";
import { type OrgPlan } from "@/prisma/client";
import { UIAlert } from "@/ui/bridge/UIAlert";
import { UIBadge } from "@/ui/bridge/UIBadge";
import { UIButton } from "@/ui/bridge/UIButton";
import { UIInput } from "@/ui/bridge/UIInput";

import { cancelOrgSubscription, openPortal, restorePurchases, updatePayAsYouWant } from "./actions";

interface BillingPanelProps {
  hasDesync?: boolean;
  invoices: BillingInvoice[];
  orgSlug: string;
  payAsYouWantCents: number;
  plan: OrgPlan;
  stripeCustomerId: null | string;
  subscriptions: SubscriptionDetail[];
}

export const BillingPanel = ({
  orgSlug,
  plan,
  stripeCustomerId,
  payAsYouWantCents,
  subscriptions,
  hasDesync = false,
  invoices,
}: BillingPanelProps) => {
  const t = useTranslations("orgAdmin.billing");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState<null | string>(null);
  const [paywAmount, setPaywAmount] = useState(String(payAsYouWantCents / 100));
  const [restoreResult, setRestoreResult] = useState<{ activated: string[]; deactivated: string[] }>();

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const handlePortal = () => {
    setError(null);
    startTransition(async () => {
      const result = await openPortal(orgSlug);
      if (result.ok) {
        window.location.href = result.data.url;
      } else {
        setError(result.error);
      }
    });
  };

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrgSubscription(orgSlug);
      if (result.ok) {
        showSuccess(t("cancelSuccess"));
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleRestore = () => {
    setError(null);
    setRestoreResult(undefined);
    startTransition(async () => {
      const result = await restorePurchases(orgSlug);
      if (result.ok) {
        setRestoreResult(result.data);
        if (result.data.activated.length === 0 && result.data.deactivated.length === 0) {
          showSuccess(t("restoreInSync"));
        } else {
          showSuccess(t("restoreSuccess"));
        }
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handlePayw = () => {
    setError(null);
    const cents = Math.round(Number(paywAmount) * 100);
    if (isNaN(cents) || cents < 0) {
      setError(t("invalidAmount"));
      return;
    }
    startTransition(async () => {
      const result = await updatePayAsYouWant(orgSlug, cents);
      if (result.ok) {
        showSuccess(t("paywSuccess"));
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const planBadgeVariant = {
    BASE: "outline" as const,
    GOV: "secondary" as const,
    GRANTED_FREE: "secondary" as const,
  };

  const formatDate = (date: Date) => new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);

  return (
    <div className="space-y-6">
      {error && <UIAlert variant="destructive" title={t("error")} description={error} />}
      {success && <UIAlert variant="success" title={success} />}

      {/* Desync warning */}
      {hasDesync && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
          <RefreshCw className="size-5 shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">{t("desyncTitle")}</p>
            <p className="text-xs text-orange-600 dark:text-orange-500">{t("desyncDescription")}</p>
          </div>
          <UIButton variant="outline" size="sm" onClick={handleRestore} disabled={isPending} className="gap-2 shrink-0">
            <RefreshCw className="size-3.5" />
            {t("restorePurchases")}
          </UIButton>
        </div>
      )}

      {/* Current plan + actions */}
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{t("currentPlan")}</h3>
            <p className="text-sm text-muted-foreground">{t(`plans.${plan}.description` as never)}</p>
          </div>
          <UIBadge variant={planBadgeVariant[plan] ?? "outline"}>{t(`plans.${plan}.label` as never)}</UIBadge>
        </div>

        {stripeCustomerId && (
          <div className="flex flex-wrap gap-3">
            {subscriptions.length > 0 && (
              <>
                <UIButton onClick={handlePortal} disabled={isPending}>
                  {t("manageSubscription")}
                </UIButton>
                <UIButton variant="outline" onClick={handleCancel} disabled={isPending}>
                  {t("cancelSubscription")}
                </UIButton>
              </>
            )}
            <UIButton variant="ghost" onClick={handleRestore} disabled={isPending} className="gap-2">
              <RefreshCw className="size-4" />
              {t("restorePurchases")}
            </UIButton>
          </div>
        )}
      </div>

      {/* Restore result */}
      {restoreResult && (restoreResult.activated.length > 0 || restoreResult.deactivated.length > 0) && (
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm font-medium">{t("restoreResult")}</p>
          {restoreResult.activated.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("restoreActivated")}: {restoreResult.activated.join(", ")}
            </p>
          )}
          {restoreResult.deactivated.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("restoreDeactivated")}: {restoreResult.deactivated.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* All subscriptions */}
      {subscriptions.map(sub => (
        <div key={sub.id} className="space-y-4 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {t("subscriptionDetail")} — {t(sub.interval)}
            </h3>
            <UIBadge variant={sub.cancelAtPeriodEnd ? "outline" : "default"}>
              {sub.cancelAtPeriodEnd ? t("cancellingStatus") : sub.status}
            </UIBadge>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">{t("periodStart")}</span>
              <p className="font-medium">{formatDate(sub.currentPeriodStart)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("periodEnd")}</span>
              <p className="font-medium">{formatDate(sub.currentPeriodEnd)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("nextPayment")}</span>
              <p className="font-medium">{formatPrice(sub.nextPaymentAmount, sub.currency, locale)}</p>
            </div>
          </div>

          {sub.cancelAtPeriodEnd && <UIAlert variant="warning" title={t("cancelAtPeriodEnd")} />}

          {sub.items.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">{t("lineItems")}</h4>
              <div className="divide-y rounded-md border">
                {sub.items.map(item => (
                  <div key={item.priceId} className="flex items-center justify-between px-4 py-2 text-sm">
                    <span>{item.description ?? item.priceId}</span>
                    <span className="font-medium">
                      {item.quantity > 1 && `${item.quantity} × `}
                      {formatPrice(item.unitAmount, sub.currency, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {subscriptions.length === 0 && stripeCustomerId && (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">{t("noSubscription")}</div>
      )}

      {/* Invoice history with line items */}
      {invoices.length > 0 && (
        <div className="space-y-4 rounded-lg border p-6">
          <h3 className="text-lg font-semibold">{t("invoiceHistory")}</h3>
          <div className="divide-y rounded-md border">
            {invoices.map(invoice => (
              <div key={invoice.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{invoice.number ?? invoice.id}</span>
                    <span className="text-muted-foreground">{formatDate(invoice.date)}</span>
                    <UIBadge variant={invoice.status === "paid" ? "default" : "outline"}>
                      {t(`invoiceStatus.${invoice.status}`)}
                    </UIBadge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatPrice(invoice.amountDue, invoice.currency, locale)}</span>
                    {invoice.hostedUrl && (
                      <a
                        href={invoice.hostedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        {t("viewInvoice")}
                      </a>
                    )}
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        PDF
                      </a>
                    )}
                  </div>
                </div>
                {invoice.lineItems.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {invoice.lineItems.map((line, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {line.description} — {formatPrice(line.amount, invoice.currency, locale)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pay-as-you-want */}
      {(plan === "GRANTED_FREE" || plan === "GOV") && (
        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <h3 className="text-lg font-semibold">{t("payAsYouWant")}</h3>
            <p className="text-sm text-muted-foreground">{t("paywDescription")}</p>
          </div>
          <div className="flex items-center gap-3">
            <UIInput
              label={`€ / ${t("month")}`}
              className="w-32"
              nativeInputProps={{
                type: "number",
                min: "0",
                step: "1",
                value: paywAmount,
                onChange: e => setPaywAmount(e.target.value),
                placeholder: "0",
              }}
            />
            <UIButton variant="outline" onClick={handlePayw} disabled={isPending}>
              {t("paywSave")}
            </UIButton>
          </div>
        </div>
      )}
    </div>
  );
};
