import "server-only";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { type Organization } from "@/prisma/client";

import { type BillingInterval } from "./checkout";
import { getPackStripePriceIds } from "./pricing";
import { stripe as stripeInstance } from "./stripe";

/**
 * Update the subscription to reflect the current active addons.
 * Each addon gets its own line item with quantity 1.
 * Adds missing addon line items, removes deactivated ones.
 */
export async function updateSubscriptionAddons(org: Organization): Promise<void> {
  if (!stripeInstance || !org.stripeSubscriptionId) return;
  const stripe = stripeInstance;

  // Get all active global addons from DB
  const activeAddons = await prisma.orgAddon.findMany({
    where: { organizationId: org.id, active: true, tenantId: null },
  });
  const activeAddonTypes = new Set(activeAddons.map(a => a.addon));

  // Retrieve current subscription
  const subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId, {
    expand: ["items.data.price"],
  });

  // Determine billing interval from first item
  const interval: BillingInterval =
    subscription.items.data[0]?.price?.recurring?.interval === "year" ? "yearly" : "monthly";

  // Build a map of current subscription items by their price ID
  const currentItemsByPriceId = new Map<string, string>();
  for (const item of subscription.items.data) {
    currentItemsByPriceId.set(item.price.id, item.id);
  }

  // Build desired price IDs from active addons
  const desiredPriceIds = new Set<string>();
  for (const addonType of activeAddonTypes) {
    const priceIds = getPackStripePriceIds(addonType);
    if (!priceIds) continue;
    const priceId = interval === "yearly" ? priceIds.yearly : priceIds.monthly;
    if (priceId) desiredPriceIds.add(priceId);
  }

  // Compute diff
  const toAdd = [...desiredPriceIds].filter(pid => !currentItemsByPriceId.has(pid));
  const toRemove = [...currentItemsByPriceId.entries()]
    .filter(([pid]) => !desiredPriceIds.has(pid))
    .map(([, itemId]) => itemId);

  if (toAdd.length === 0 && toRemove.length === 0) return;

  // If removing all items and nothing to add → cancel subscription
  if (desiredPriceIds.size === 0) {
    await stripe.subscriptions.cancel(org.stripeSubscriptionId);
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeSubscriptionId: null },
    });
    logger.info({ orgId: org.id }, "Subscription cancelled — no more active addons");
    return;
  }

  // Build update items array
  const items: Array<{ deleted?: true; id?: string; price?: string; quantity?: number }> = [];

  // Keep existing items that are still desired
  for (const item of subscription.items.data) {
    if (desiredPriceIds.has(item.price.id)) {
      items.push({ id: item.id });
    } else {
      items.push({ id: item.id, deleted: true });
    }
  }

  // Add new items
  for (const priceId of toAdd) {
    items.push({ price: priceId, quantity: 1 });
  }

  await stripe.subscriptions.update(org.stripeSubscriptionId, { items });
}

/**
 * Cancel an Organization's Stripe Subscription.
 * In dev (no Stripe), clears subscription + deactivates addons.
 */
export async function cancelSubscription(org: Organization): Promise<void> {
  if (!stripeInstance) {
    // Dev mode — deactivate addons + clear subscription
    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeSubscriptionId: null },
    });
    await prisma.orgAddon.updateMany({
      where: { organizationId: org.id, active: true },
      data: { active: false },
    });
    logger.info({ orgId: org.id }, "[dev] Subscription cancelled — addons deactivated (Stripe bypassed)");
    return;
  }
  if (!org.stripeCustomerId) return;
  const stripe = stripeInstance;

  const subscriptions = await stripe.subscriptions.list({
    customer: org.stripeCustomerId,
    status: "active",
    limit: 100,
  });

  for (const sub of subscriptions.data) {
    await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Set Pay-As-You-Want contribution amount for a non-billing org (GRANTED_FREE / GOV).
 */
export async function setPayAsYouWant(org: Organization, amountCents: number): Promise<void> {
  await prisma.organization.update({
    where: { id: org.id },
    data: { payAsYouWantCents: Math.max(0, amountCents) },
  });
}
