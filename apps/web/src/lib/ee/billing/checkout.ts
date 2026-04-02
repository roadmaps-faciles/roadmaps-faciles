import "server-only";

import type Stripe from "stripe";

import { config } from "@/config";
import {
  ADDON_PACKS,
  BUNDLE_COMPLETE,
  BUNDLE_PRO,
  type PurchasableId,
  resolveAddonsForPurchase,
} from "@/lib/model/Pricing";
import { type Organization } from "@/prisma/client";

import { getOrCreateCustomer } from "./customers";
import { getPackStripePriceIds } from "./pricing";
import { stripe } from "./stripe";

export type BillingInterval = "monthly" | "yearly";

/**
 * Create a Stripe Checkout Session for a pack or bundle subscription.
 * The checkout creates a subscription with a single line item (the pack/bundle price).
 * Metadata includes the purchaseId so the webhook can expand it to individual addons.
 *
 * When Stripe is not configured (no `STRIPE_SECRET_KEY`), returns a fake session
 * pointing to a local dev-checkout route that simulates activation.
 */
export async function createPackCheckoutSession(
  org: Organization,
  purchaseId: PurchasableId,
  successUrl: string,
  cancelUrl: string,
  interval: BillingInterval = "monthly",
  forceStripe = false,
): Promise<Pick<Stripe.Checkout.Session, "url">> {
  const addons = resolveAddonsForPurchase(purchaseId);
  if (addons.length === 0) {
    throw new Error(`Unknown purchase ID: ${purchaseId}`);
  }

  // Dev bypass: skip Stripe when not configured, or when dev toggle is off
  const useDevCheckout = !stripe || (config.env === "dev" && !forceStripe);
  if (useDevCheckout) {
    const devUrl = new URL("/api/ee/billing/dev-checkout", config.host);
    devUrl.searchParams.set("orgId", String(org.id));
    devUrl.searchParams.set("purchaseId", purchaseId);
    devUrl.searchParams.set("addons", addons.join(","));
    devUrl.searchParams.set("interval", interval);
    devUrl.searchParams.set("successUrl", successUrl);
    return { url: devUrl.toString() };
  }

  if (!stripe) throw new Error("Stripe is not configured");

  const customerId = await getOrCreateCustomer(org);

  const priceIds = getPackStripePriceIds(purchaseId);
  if (!priceIds) {
    throw new Error(`No Stripe price configured for: ${purchaseId}`);
  }

  const priceId = interval === "yearly" ? priceIds.yearly : priceIds.monthly;
  if (!priceId) {
    throw new Error(`No ${interval} price configured for: ${purchaseId}`);
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orgId: String(org.id),
      orgSlug: org.slug,
      purchaseId,
      addons: addons.join(","),
    },
    subscription_data: {
      metadata: {
        orgId: String(org.id),
        orgSlug: org.slug,
        purchaseId,
        addons: addons.join(","),
      },
    },
  });
}

/**
 * Create a Stripe Checkout Session for multiple packs.
 * Auto-substitutes a bundle price when all packs in a bundle are selected.
 * When Stripe is not configured, falls back to dev-checkout.
 */
export async function createMultiPackCheckoutSession(
  org: Organization,
  packIds: string[],
  successUrl: string,
  cancelUrl: string,
  interval: BillingInterval = "monthly",
  forceStripe = false,
  customerEmail?: string,
): Promise<Pick<Stripe.Checkout.Session, "url">> {
  if (packIds.length === 0) throw new Error("No packs selected");

  // Auto-substitute bundle if applicable
  const selectedSet = new Set(packIds);
  const allProPacks = ADDON_PACKS.filter(p => BUNDLE_PRO.packs.includes(p.id));
  const allPacks = ADDON_PACKS;

  let effectiveIds: string[];
  if (allPacks.every(p => selectedSet.has(p.id))) {
    effectiveIds = [BUNDLE_COMPLETE.id];
  } else if (allProPacks.every(p => selectedSet.has(p.id)) && !selectedSet.has("ssoEnterprise")) {
    effectiveIds = [BUNDLE_PRO.id];
  } else {
    effectiveIds = packIds;
  }

  // Collect all addons across all selected packs
  const allAddons = effectiveIds.flatMap(id => resolveAddonsForPurchase(id));
  const uniqueAddons = [...new Set(allAddons)];

  // Dev bypass
  const useDevCheckout = !stripe || (config.env === "dev" && !forceStripe);
  if (useDevCheckout) {
    const devUrl = new URL("/api/ee/billing/dev-checkout", config.host);
    devUrl.searchParams.set("orgId", String(org.id));
    devUrl.searchParams.set("purchaseId", effectiveIds.join(","));
    devUrl.searchParams.set("addons", uniqueAddons.join(","));
    devUrl.searchParams.set("interval", interval);
    devUrl.searchParams.set("successUrl", successUrl);
    return { url: devUrl.toString() };
  }

  if (!stripe) throw new Error("Stripe is not configured");

  const customerId = await getOrCreateCustomer(org);

  // Build line items — one per effective pack/bundle
  const lineItems: Array<{ price: string; quantity: number }> = [];
  for (const id of effectiveIds) {
    const priceIds = getPackStripePriceIds(id);
    if (!priceIds) throw new Error(`No Stripe price configured for: ${id}`);
    const priceId = interval === "yearly" ? priceIds.yearly : priceIds.monthly;
    if (!priceId) throw new Error(`No ${interval} price configured for: ${id}`);
    lineItems.push({ price: priceId, quantity: 1 });
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,

    // Collect billing info
    billing_address_collection: "required",
    customer_update: { address: "auto", name: "auto" },
    tax_id_collection: { enabled: true },

    // UX enhancements
    allow_promotion_codes: true,
    ...(customerEmail && !customerId ? { customer_email: customerEmail } : {}),

    // CGV acceptance
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message: `J'accepte les [conditions générales](${config.host}/cgu)`,
      },
    },

    // Session expires in 30 minutes
    expires_at: Math.floor(Date.now() / 1000) + 60 * 30,

    metadata: {
      orgId: String(org.id),
      orgSlug: org.slug,
      purchaseIds: effectiveIds.join(","),
      addons: uniqueAddons.join(","),
    },
    subscription_data: {
      metadata: {
        orgId: String(org.id),
        orgSlug: org.slug,
        purchaseIds: effectiveIds.join(","),
        addons: uniqueAddons.join(","),
      },
    },
  });
}

/**
 * Create a Stripe Customer Portal session for self-service billing management.
 *
 * When Stripe is not configured, returns a fake session redirecting back to returnUrl.
 */
export async function createPortalSession(
  org: Organization,
  returnUrl: string,
): Promise<Pick<Stripe.BillingPortal.Session, "url">> {
  if (!stripe) {
    return { url: returnUrl };
  }

  if (!org.stripeCustomerId) {
    throw new Error("Organization has no Stripe customer. Subscribe first.");
  }
  return stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: returnUrl,
  });
}
