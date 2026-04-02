import "server-only";
import { cache } from "react";

import { config } from "@/config";
import { ADDON_PACKS, BUNDLE_COMPLETE, BUNDLE_PRO, type PurchasableId } from "@/lib/model/Pricing";

import { type PricingInfo } from "./format";
import { stripe } from "./stripe";

export type { PricingInfo } from "./format";
export { formatPrice } from "./format";

// --- Stripe Price IDs per environment ---

interface StripePriceConfig {
  monthly: string;
  yearly: string;
}

/**
 * Stripe Price IDs by pack/bundle, per environment.
 * Price IDs are NOT secrets — they're public identifiers.
 */
const STRIPE_PRICES: Record<string, Record<string, StripePriceConfig>> = {
  // Test mode (Roadmaps Faciles Stripe account)
  test: {
    customDomain: { monthly: "price_1TGKtmRuBCVNYdmeeBsKsK4F", yearly: "price_1TGKtmRuBCVNYdmeOCMYo5No" },
    multiTenant: { monthly: "price_1TGKyBRuBCVNYdmeFXgY5I9O", yearly: "price_1TGKyBRuBCVNYdmeGAkXVMpD" },
    integrations: { monthly: "price_1TGL88RuBCVNYdmec3UK7Nox", yearly: "price_1TGL88RuBCVNYdmeR70nGqg4" },
    apiWebhooks: { monthly: "price_1TGLL1RuBCVNYdmeaXEfouo4", yearly: "price_1TGLL1RuBCVNYdme96e73qtX" },
    auditCompliance: { monthly: "price_1TGLOURuBCVNYdmeUSaZjogm", yearly: "price_1TGLOURuBCVNYdmetz4htFys" },
    analytics: { monthly: "price_1TGLXXRuBCVNYdmermPV8OpJ", yearly: "price_1TGLXXRuBCVNYdmewTt2EwTq" },
    ssoEnterprise: { monthly: "price_1TGLgCRuBCVNYdmew0CKpMlw", yearly: "price_1TGLgCRuBCVNYdmePFAQlyK8" },
    bundlePro: { monthly: "price_1TGMVqRuBCVNYdmeGtwv2w9R", yearly: "price_1TGMVqRuBCVNYdmeUTP1OlJC" },
    bundleComplete: { monthly: "price_1TGMYeRuBCVNYdmeEK6rcM3X", yearly: "price_1TGMYeRuBCVNYdmebm5coBO0" },
  },
  // Production — TODO: create live mode prices and fill in
  prod: {},
};

function getPriceConfig(): Record<string, StripePriceConfig> {
  const env = config.env === "prod" ? "prod" : "test";
  return STRIPE_PRICES[env] ?? {};
}

// --- Dev mode fallback (no Stripe) ---

const DEV_PACK_PRICES = Object.fromEntries([
  ...ADDON_PACKS.map(p => [
    p.id,
    { monthly: p.monthlyPrice * 100, yearly: p.monthlyPrice * 100 * 10, currency: "eur" },
  ]),
  [
    BUNDLE_PRO.id,
    { monthly: BUNDLE_PRO.monthlyPrice * 100, yearly: BUNDLE_PRO.monthlyPrice * 100 * 10, currency: "eur" },
  ],
  [
    BUNDLE_COMPLETE.id,
    { monthly: BUNDLE_COMPLETE.monthlyPrice * 100, yearly: BUNDLE_COMPLETE.monthlyPrice * 100 * 10, currency: "eur" },
  ],
]) as Record<string, PricingInfo>;

// --- Public API ---

async function fetchPrice(priceId: string): Promise<{ amount: number; currency: string }> {
  if (!stripe || !priceId) return { amount: 0, currency: "eur" };
  const price = await stripe.prices.retrieve(priceId);
  return { amount: price.unit_amount ?? 0, currency: price.currency };
}

/**
 * Get pricing for a specific pack or bundle.
 * Cached per request via React.cache().
 */
export const getPackPricing = cache(async (packId: PurchasableId): Promise<PricingInfo> => {
  if (!stripe) return DEV_PACK_PRICES[packId] ?? { monthly: 500, yearly: 4800, currency: "eur" };

  const prices = getPriceConfig();
  const priceConfig = prices[packId];
  if (!priceConfig) return { monthly: 0, yearly: 0, currency: "eur" };

  const [monthly, yearly] = await Promise.all([fetchPrice(priceConfig.monthly), fetchPrice(priceConfig.yearly)]);
  return { monthly: monthly.amount, yearly: yearly.amount, currency: monthly.currency };
});

/**
 * Get pricing for all packs + bundles.
 * Cached per request via React.cache().
 */
export const getAllPackPricing = cache(async (): Promise<Record<string, PricingInfo>> => {
  if (!stripe) return DEV_PACK_PRICES;

  const prices = getPriceConfig();
  const result: Record<string, PricingInfo> = {};

  await Promise.all(
    Object.entries(prices).map(async ([packId, priceIds]) => {
      const [monthly, yearly] = await Promise.all([fetchPrice(priceIds.monthly), fetchPrice(priceIds.yearly)]);
      result[packId] = { monthly: monthly.amount, yearly: yearly.amount, currency: monthly.currency };
    }),
  );

  return result;
});

/**
 * Get the Stripe Price IDs for a specific pack or bundle.
 * Returns null if not configured for the current environment.
 */
export function getPackStripePriceIds(packId: string): null | StripePriceConfig {
  const prices = getPriceConfig();
  return prices[packId] ?? null;
}
