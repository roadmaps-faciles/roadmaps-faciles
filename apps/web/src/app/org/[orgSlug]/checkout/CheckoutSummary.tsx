"use client";

import { Button, Card, cn } from "@roadmaps-faciles/ui";
import { ArrowRight, ShoppingCart, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { type BillingInterval } from "@/lib/ee/billing/checkout";
import { ADDON_PACKS, BUNDLE_PRO, type AddonPack } from "@/lib/model/Pricing";

import { startMultiCheckout } from "./actions";

interface CartItem {
  interval: BillingInterval;
  packId: string;
}

export type CartItemInit = CartItem;

interface CheckoutSummaryProps {
  autopay?: boolean;
  cartInit: CartItem[];
  orgSlug: string;
}

export const CheckoutSummary = ({ cartInit, orgSlug, autopay }: CheckoutSummaryProps) => {
  const t = useTranslations("orgAdmin.checkout");
  const tp = useTranslations("pricing.packs");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const [cartItems, setCartItems] = useState<CartItem[]>(cartInit);
  const autopayTriggered = useRef(false);

  const selectedPacks = ADDON_PACKS.filter(p => cartItems.some(c => c.packId === p.id));

  const getItemInterval = (packId: string): BillingInterval =>
    cartItems.find(c => c.packId === packId)?.interval ?? "monthly";

  const setItemInterval = (packId: string, interval: BillingInterval) =>
    setCartItems(prev => prev.map(c => (c.packId === packId ? { ...c, interval } : c)));

  const removeItem = (packId: string) => {
    setCartItems(prev => {
      const next = prev.filter(c => c.packId !== packId);
      return next;
    });
  };

  const getPrice = (pack: AddonPack) => {
    const iv = getItemInterval(pack.id);
    return iv === "yearly" ? pack.monthlyPrice * 10 : pack.monthlyPrice;
  };

  const getSuffix = (packId: string) => {
    const iv = getItemInterval(packId);
    return iv === "yearly" ? t("perYear") : t("perMonth");
  };

  // Total calculation — group by interval
  const monthlyItems = cartItems.filter(c => c.interval === "monthly");
  const yearlyItems = cartItems.filter(c => c.interval === "yearly");
  const monthlyTotal = monthlyItems.reduce((s, c) => {
    const pack = ADDON_PACKS.find(p => p.id === c.packId);
    return s + (pack?.monthlyPrice ?? 0);
  }, 0);
  const yearlyTotal = yearlyItems.reduce((s, c) => {
    const pack = ADDON_PACKS.find(p => p.id === c.packId);
    return s + (pack ? pack.monthlyPrice * 10 : 0);
  }, 0);

  // Bundle incentive
  const proPacks = ADDON_PACKS.filter(p => BUNDLE_PRO.packs.includes(p.id));
  const missingForPro = proPacks.filter(p => !cartItems.some(c => c.packId === p.id));
  const showProIncentive = missingForPro.length > 0 && missingForPro.length <= 2 && selectedPacks.length >= 2;

  const addProPacks = () => {
    const defaultInterval = cartItems[0]?.interval ?? "monthly";
    setCartItems(prev => {
      const existing = new Set(prev.map(c => c.packId));
      const toAdd = proPacks.filter(p => !existing.has(p.id)).map(p => ({ packId: p.id, interval: defaultInterval }));
      return [...prev, ...toAdd];
    });
  };

  const handlePay = () => {
    startTransition(async () => {
      setError(undefined);
      // Group by interval — create one checkout per interval
      const groups: Record<BillingInterval, string[]> = { monthly: [], yearly: [] };
      for (const item of cartItems) {
        groups[item.interval].push(item.packId);
      }

      // Start with the first non-empty group
      const intervals = (["monthly", "yearly"] as const).filter(iv => groups[iv].length > 0);
      if (intervals.length === 0) return;

      // First interval checkout — pass pending second interval in successUrl
      const firstInterval = intervals[0];
      const secondInterval = intervals.length > 1 ? intervals[1] : undefined;

      const result = await startMultiCheckout({
        orgSlug,
        items: groups[firstInterval],
        interval: firstInterval,
        pendingItems: secondInterval ? groups[secondInterval] : undefined,
        pendingInterval: secondInterval,
      });

      if (result.ok) {
        window.location.href = result.data.url;
      } else {
        setError(result.error);
      }
    });
  };

  // Auto-pay on return from first checkout (second interval pending)
  useEffect(() => {
    if (autopay && !autopayTriggered.current && cartItems.length > 0) {
      autopayTriggered.current = true;
      handlePay();
    }
  }, [autopay]); // eslint-disable-line react-hooks/exhaustive-deps

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingCart className="mx-auto size-12 text-muted-foreground/30" />
        <p className="mt-4 text-muted-foreground">{t("emptyCart")}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href={`/org/${orgSlug}/addons`}>{t("backToAddons")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <h2 className="text-lg font-semibold">{t("itemsTitle")}</h2>

      {/* Items list with per-item interval toggle */}
      <div className="space-y-2">
        {selectedPacks.map(pack => (
          <Card key={pack.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{tp(`${pack.id}.name` as never)}</p>
                <p className="text-xs text-muted-foreground">{tp(`${pack.id}.description` as never)}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Per-item interval toggle */}
                <div className="flex items-center gap-0.5 rounded-full border p-0.5">
                  <button
                    type="button"
                    onClick={() => setItemInterval(pack.id, "monthly")}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                      getItemInterval(pack.id) === "monthly"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {t("monthly")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemInterval(pack.id, "yearly")}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                      getItemInterval(pack.id) === "yearly"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {t("yearly")}
                  </button>
                </div>
                <span className="text-sm font-bold">
                  {getPrice(pack)}€
                  <span className="text-xs font-normal text-muted-foreground">/{getSuffix(pack.id)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(pack.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bundle incentive */}
      {showProIncentive && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <Sparkles className="size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {t("proIncentive", { missing: missingForPro.map(p => tp(`${p.id}.name` as never)).join(", ") })}
            </p>
            <p className="text-xs text-muted-foreground">{t("proIncentiveSave")}</p>
          </div>
          <Button size="sm" variant="outline" onClick={addProPacks}>
            {t("addMissing")}
          </Button>
        </div>
      )}

      {/* Multi-interval notice */}
      {monthlyItems.length > 0 && yearlyItems.length > 0 && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
          <p className="text-xs text-orange-700 dark:text-orange-400">{t("multiIntervalNotice")}</p>
        </div>
      )}

      {/* Total */}
      <div className="rounded-lg border p-4 space-y-2">
        {monthlyTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("monthlyTotal")}</span>
            <span className="font-medium">
              {monthlyTotal}€/{t("perMonth")}
            </span>
          </div>
        )}
        {yearlyTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("yearlyTotal")}</span>
            <span className="font-medium">
              {yearlyTotal}€/{t("perYear")}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/org/${orgSlug}/addons`}>{t("backToAddons")}</Link>
        </Button>
        <Button onClick={handlePay} disabled={isPending} className="flex-1 gap-2">
          {isPending ? "..." : t("pay")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
