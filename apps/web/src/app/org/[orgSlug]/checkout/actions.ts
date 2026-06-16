"use server";

import { cookies, headers } from "next/headers";

import { config } from "@/config";
import { assertCloud } from "@/lib/deployment";
import { createMultiPackCheckoutSession, type BillingInterval } from "@/lib/ee/billing/checkout";
import { ALL_PURCHASABLE_IDS } from "@/lib/model/Pricing";
import { organizationRepo } from "@/lib/repo";
import { assertOrgAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

/**
 * Encode cart items as "pack1:monthly,pack2:yearly" for URL serialization.
 */
function encodeCartItems(
  items: string[],
  interval: BillingInterval,
  pendingItems?: string[],
  pendingInterval?: BillingInterval,
): string {
  const parts = items.map(id => `${id}:${interval}`);
  if (pendingItems && pendingInterval) {
    parts.push(...pendingItems.map(id => `${id}:${pendingInterval}`));
  }
  return parts.join(",");
}

export const startMultiCheckout = async (data: {
  interval: BillingInterval;
  items: string[];
  orgSlug: string;
  /** Remaining items+interval for a second checkout after this one completes */
  pendingItems?: string[];
  pendingInterval?: BillingInterval;
}): Promise<ServerActionResponse<{ url: string }>> => {
  await assertCloud();
  const org = await organizationRepo.findBySlug(data.orgSlug);
  if (!org) return { ok: false, error: "Organization not found" };

  const authSession = await assertOrgAdmin(org.id);
  const customerEmail = authSession.user.email ?? undefined;

  // Validate pack IDs against known list
  const validIds = new Set(ALL_PURCHASABLE_IDS as readonly string[]);
  const invalidItems = data.items.filter(id => !validIds.has(id));
  if (invalidItems.length > 0) return { ok: false, error: `Unknown pack IDs: ${invalidItems.join(", ")}` };
  if (data.pendingItems?.some(id => !validIds.has(id))) return { ok: false, error: "Invalid pending pack IDs" };

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || new URL(config.host).host;
  const protocol = hdrs.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  // If there are pending items, redirect back to checkout after this payment
  let successUrl: string;
  if (data.pendingItems && data.pendingItems.length > 0 && data.pendingInterval) {
    successUrl = `${baseUrl}/org/${data.orgSlug}/checkout?items=${data.pendingItems.join(",")}&interval=${data.pendingInterval}&autopay=1`;
  } else {
    successUrl = `${baseUrl}/org/${data.orgSlug}/addons?checkout=success`;
  }

  // Cancel URL restores the FULL cart (current + pending items with their intervals)
  const fullCart = encodeCartItems(data.items, data.interval, data.pendingItems, data.pendingInterval);
  const cancelUrl = `${baseUrl}/org/${data.orgSlug}/checkout?cart=${encodeURIComponent(fullCart)}&cancelled=1`;

  const useStripe = config.env === "dev" ? (await cookies()).get("dev-use-stripe")?.value === "1" : true;

  try {
    const checkoutSession = await createMultiPackCheckoutSession(
      org,
      data.items,
      successUrl,
      cancelUrl,
      data.interval,
      useStripe,
      customerEmail,
    );
    return { ok: true, data: { url: checkoutSession.url ?? successUrl } };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
};
