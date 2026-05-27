"use client";

import { Badge, Button, cn } from "@roadmaps-faciles/ui";
import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roadmaps-faciles/ui/components/dialog";
import {
  ArrowRight,
  Check,
  Globe,
  Key,
  Layers,
  Plug,
  ScrollText,
  Shield,
  Signal,
  ShoppingCart,
  Sparkles,
  Webhook,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import { type BillingInterval } from "@/lib/ee/billing/checkout";
import { formatPrice, type PricingInfo } from "@/lib/ee/billing/format";
import { ADDON_PACKS, BUNDLE_COMPLETE, BUNDLE_PRO, type AddonPack } from "@/lib/model/Pricing";
import { type OrgAddon, type OrgPlan } from "@/prisma/client";

import { activateBundle, startCheckout, toggleOrgPack } from "./actions";

const PACK_ICONS: Record<string, typeof Key> = {
  customDomain: Globe,
  multiTenant: Layers,
  integrations: Plug,
  apiWebhooks: Webhook,
  auditCompliance: ScrollText,
  analytics: Signal,
  ssoEnterprise: Shield,
};

interface ConfirmAction {
  active: boolean;
  label: string;
  packId: string;
  price: string;
}

interface OrgAddonsListProps {
  addonPricing: Record<string, PricingInfo>;
  addons: OrgAddon[];
  billingInterval: BillingInterval;
  canEdit?: boolean;
  hasSubscription: boolean;
  orgId: number;
  orgSlug: string;
  plan: OrgPlan;
  tenants: Array<{ id: number; name: string }>;
  useStripeCheckout?: boolean;
}

export const OrgAddonsList = ({
  addons,
  orgId,
  orgSlug,
  plan: _plan,
  addonPricing,
  billingInterval: initialInterval,
  hasSubscription,
  canEdit = false,
  useStripeCheckout = false,
}: OrgAddonsListProps) => {
  const t = useTranslations("orgAdmin.addons");
  const tp = useTranslations("pricing.packs");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState(false);
  const [pendingPack, setPendingPack] = useState<null | string>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(initialInterval);
  const [cart, setCart] = useState<string[]>([]);

  const addToCart = (packId: string) => setCart(prev => (prev.includes(packId) ? prev : [...prev, packId]));
  const removeFromCart = (packId: string) => setCart(prev => prev.filter(id => id !== packId));
  const isInCart = (packId: string) => cart.includes(packId);
  const checkoutUrl = `/org/${orgSlug}/checkout?items=${cart.join(",")}&interval=${billingInterval}`;

  const isAddonActive = (addon: string) => addons.some(a => a.addon === addon && a.tenantId === null && a.active);
  const getAddonInterval = (addon: string) =>
    addons.find(a => a.addon === addon && a.tenantId === null && a.active)?.billingInterval;
  const getPackInterval = (pack: AddonPack): null | string => {
    const intervals = pack.addons.map(a => getAddonInterval(a)).filter(Boolean);
    if (intervals.length === 0) return null;
    return intervals[0] ?? null;
  };
  const isPackActive = (pack: AddonPack) => pack.addons.every(a => isAddonActive(a));
  const isPackPartial = (pack: AddonPack) => pack.addons.some(a => isAddonActive(a)) && !isPackActive(pack);

  const getPrice = (packId: string): number => {
    const pricing = addonPricing[packId];
    if (!pricing) return 0;
    return billingInterval === "yearly" ? pricing.yearly : pricing.monthly;
  };

  const getPriceLabel = (packId: string): string => {
    const pricing = addonPricing[packId];
    if (!pricing) return "";
    const price = billingInterval === "yearly" ? pricing.yearly : pricing.monthly;
    return formatPrice(price, pricing.currency, locale);
  };

  // --- Incentive calculations ---
  const proPacks = ADDON_PACKS.filter(p => BUNDLE_PRO.packs.includes(p.id));
  const activeProPacks = proPacks.filter(p => isPackActive(p));
  const inactiveProPacks = proPacks.filter(p => !isPackActive(p));
  const allProActive = inactiveProPacks.length === 0;
  const allActive = ADDON_PACKS.every(p => isPackActive(p));
  const ssoActive = isPackActive(ADDON_PACKS.find(p => p.id === "ssoEnterprise")!);

  // Pro bundle upgrade price (what they'd save)
  const proPrice = getPrice(BUNDLE_PRO.id) || (billingInterval === "yearly" ? 429_00 : BUNDLE_PRO.monthlyPrice * 100);
  const completePrice =
    getPrice(BUNDLE_COMPLETE.id) || (billingInterval === "yearly" ? 539_00 : BUNDLE_COMPLETE.monthlyPrice * 100);

  // Incentive: "1 pack left for Pro"
  const onePackFromPro = inactiveProPacks.length === 1 && activeProPacks.length >= 1;
  // Incentive: "all Pro active, upgrade to Complete for +X"
  const proActiveUpgradeComplete = allProActive && !ssoActive;
  // Extra cost for Complete vs Pro
  const completeUpgradeCost = completePrice - proPrice;

  const handlePurchase = (purchaseId: string) => {
    setError(null);
    setPendingPack(purchaseId);
    startTransition(async () => {
      if (useStripeCheckout) {
        const result = await startCheckout({ orgSlug, purchaseId: purchaseId, interval: billingInterval });
        setPendingPack(null);
        if (result.ok) {
          window.location.href = result.data.url;
        } else {
          setError(result.error);
        }
      } else {
        const isBundleId = purchaseId === "bundlePro" || purchaseId === "bundleComplete";
        const result = isBundleId
          ? await activateBundle({ organizationId: orgId, bundleId: purchaseId })
          : await toggleOrgPack({ organizationId: orgId, packId: purchaseId, active: true });
        setPendingPack(null);
        if (result.ok) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          router.refresh();
        } else {
          setError(result.error);
        }
      }
    });
  };

  const togglePackAction = useCallback(
    (pack: AddonPack, active: boolean) => {
      setError(null);
      setSuccess(false);
      setPendingPack(pack.id);
      startTransition(async () => {
        const result = await toggleOrgPack({ organizationId: orgId, packId: pack.id, active });
        setPendingPack(null);
        if (result.ok) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          router.refresh();
        } else {
          setError(result.error);
        }
      });
    },
    [orgId, router],
  );

  const requestToggle = (pack: AddonPack, active: boolean) => {
    if (hasSubscription && active) {
      setConfirmAction({
        packId: pack.id,
        label: tp(`${pack.id}.name` as never),
        active,
        price: getPriceLabel(pack.id),
      });
      return;
    }
    togglePackAction(pack, active);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const pack = ADDON_PACKS.find(p => p.id === confirmAction.packId);
    if (!pack) return;
    setConfirmAction(null);
    togglePackAction(pack, confirmAction.active);
  };

  const activePackCount = ADDON_PACKS.filter(p => isPackActive(p)).length;
  const suffix = billingInterval === "yearly" ? t("perYear") : t("perMonth");

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>{t("toggled")}</AlertTitle>
        </Alert>
      )}

      {/* Billing interval toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("enabledCount", { count: activePackCount })}</p>
        <div className="flex items-center gap-1 rounded-full border bg-card p-1">
          <button
            type="button"
            onClick={() => setBillingInterval("monthly")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              billingInterval === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("monthlyLabel")}
          </button>
          <button
            type="button"
            onClick={() => setBillingInterval("yearly")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              billingInterval === "yearly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("yearlyLabel")}
          </button>
        </div>
      </div>

      {/* Bundle incentives */}
      {canEdit && (
        <div className="space-y-3">
          {/* Incentive: 1 pack from Pro */}
          {onePackFromPro && !allProActive && (
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <Sparkles className="size-5 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {t("incentiveOneFromPro", { pack: tp(`${inactiveProPacks[0].id}.name` as never) })}
                </p>
                <p className="text-xs text-muted-foreground">{t("incentiveProSave")}</p>
              </div>
              <Button size="sm" onClick={() => handlePurchase("bundlePro")} disabled={isPending}>
                {pendingPack === "bundlePro" ? "…" : t("upgradeToPro", { price: formatPrice(proPrice, "eur", locale) })}
              </Button>
            </div>
          )}

          {/* Incentive: Pro active → upgrade to Complete */}
          {proActiveUpgradeComplete && (
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <Sparkles className="size-5 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t("incentiveUpgradeComplete")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("incentiveCompleteDelta", { delta: formatPrice(completeUpgradeCost, "eur", locale) })}
                </p>
              </div>
              <Button size="sm" onClick={() => handlePurchase("bundleComplete")} disabled={isPending}>
                {pendingPack === "bundleComplete" ? "…" : t("upgradeToComplete")}
              </Button>
            </div>
          )}

          {/* Standard bundle buttons (when no specific incentive) */}
          {!onePackFromPro && !proActiveUpgradeComplete && (
            <div className="flex flex-wrap gap-3">
              {useStripeCheckout ? (
                <>
                  <Button variant={allProActive ? "secondary" : "default"} size="sm" disabled={allProActive} asChild>
                    <Link
                      href={`/org/${orgSlug}/checkout?items=${proPacks
                        .filter(p => !isPackActive(p))
                        .map(p => p.id)
                        .join(",")}&interval=${billingInterval}`}
                    >
                      {t("activateBundlePro", { price: formatPrice(proPrice, "eur", locale) })}
                    </Link>
                  </Button>
                  <Button variant={allActive ? "secondary" : "default"} size="sm" disabled={allActive} asChild>
                    <Link
                      href={`/org/${orgSlug}/checkout?items=${ADDON_PACKS.filter(p => !isPackActive(p))
                        .map(p => p.id)
                        .join(",")}&interval=${billingInterval}`}
                    >
                      {t("activateBundleComplete", { price: formatPrice(completePrice, "eur", locale) })}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={allProActive ? "secondary" : "default"}
                    size="sm"
                    disabled={isPending || allProActive}
                    onClick={() => handlePurchase("bundlePro")}
                  >
                    {pendingPack === "bundlePro"
                      ? "…"
                      : t("activateBundlePro", { price: formatPrice(proPrice, "eur", locale) })}
                  </Button>
                  <Button
                    variant={allActive ? "secondary" : "default"}
                    size="sm"
                    disabled={isPending || allActive}
                    onClick={() => handlePurchase("bundleComplete")}
                  >
                    {pendingPack === "bundleComplete"
                      ? "…"
                      : t("activateBundleComplete", { price: formatPrice(completePrice, "eur", locale) })}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pack cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ADDON_PACKS.map(pack => {
          const active = isPackActive(pack);
          const partial = isPackPartial(pack);
          const Icon = PACK_ICONS[pack.id] ?? Key;
          const isLoading = isPending && pendingPack === pack.id;
          const priceLabel = `${getPriceLabel(pack.id) || `${pack.monthlyPrice}€`}/${suffix}`;

          return (
            <div
              key={pack.id}
              className={`flex flex-col rounded-lg border transition-colors ${active ? "border-primary/30 bg-primary/5" : "bg-card"}`}
            >
              <div className="flex items-start gap-3 p-5">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{tp(`${pack.id}.name` as never)}</h3>
                    {active && (
                      <>
                        <Badge variant="default" className="shrink-0 gap-1 text-[10px]">
                          <Check className="size-3" />
                          {t("active")}
                        </Badge>
                        {getPackInterval(pack) && (
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {getPackInterval(pack) === "YEARLY" ? t("yearlyLabel") : t("monthlyLabel")}
                          </Badge>
                        )}
                      </>
                    )}
                    {partial && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {t("partial")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs/relaxed text-muted-foreground">{tp(`${pack.id}.description` as never)}</p>
                  <p className="mt-1 text-xs font-medium text-primary">{priceLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {pack.addons.map(addon => (
                      <Badge key={addon} variant={isAddonActive(addon) ? "default" : "outline"} className="text-[10px]">
                        {t(`addonNames.${addon}` as never)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-2 border-t px-5 py-3">
                  {!active ? (
                    useStripeCheckout ? (
                      isInCart(pack.id) ? (
                        <Button variant="outline" size="sm" onClick={() => removeFromCart(pack.id)}>
                          {t("removeFromCart")}
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" onClick={() => addToCart(pack.id)} className="gap-1.5">
                          <ShoppingCart className="size-3.5" />
                          {t("addToCart")}
                        </Button>
                      )
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => requestToggle(pack, true)}
                        disabled={isLoading}
                      >
                        {isLoading ? "…" : t("activate")}
                      </Button>
                    )
                  ) : useStripeCheckout ? (
                    <Button variant="outline" size="sm" className="ml-auto" asChild>
                      <Link href={`/org/${orgSlug}/billing`}>{t("manageBilling")}</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => requestToggle(pack, false)}
                      disabled={isLoading}
                    >
                      {isLoading ? "…" : t("deactivate")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation modal */}
      {/* Floating cart banner */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card p-4 shadow-lg">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="size-5 text-primary" />
              <span className="text-sm font-medium">{t("cartCount", { count: cart.length })}</span>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link href={checkoutUrl}>
                {t("viewCart")}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!confirmAction} onOpenChange={open => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.active ? t("confirmActivateTitle") : t("confirmDeactivateTitle")}</DialogTitle>
            <DialogDescription>
              {confirmAction?.active
                ? t("confirmActivateDescription", { addon: confirmAction.label, price: confirmAction.price })
                : t("confirmDeactivateDescription", { addon: confirmAction?.label ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            <Button variant={confirmAction?.active ? "default" : "destructive"} onClick={handleConfirm}>
              {confirmAction?.active ? t("confirmActivate") : t("confirmDeactivate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
