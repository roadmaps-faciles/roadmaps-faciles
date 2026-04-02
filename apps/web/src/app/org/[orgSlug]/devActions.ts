"use server";

import { revalidatePath } from "next/cache";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/ee/billing/stripe";
import { logger } from "@/lib/logger";
import { organizationRepo } from "@/lib/repo";
import { assertOrgOwner } from "@/utils/auth";

/**
 * Dev-only: cancel all Stripe subscriptions for the org customer,
 * clear Stripe IDs from org, and deactivate all addons.
 */
export async function cleanStripeCustomer(orgSlug: string): Promise<string> {
  if (config.env !== "dev") return "This action is only available in dev mode";
  const org = await organizationRepo.findBySlug(orgSlug);
  if (!org) return "Organization not found";

  await assertOrgOwner(org.id);

  if (!org.stripeCustomerId) return "No Stripe customer linked";

  let cancelledCount = 0;

  // Cancel all active subscriptions on Stripe
  if (stripe) {
    const subs = await stripe.subscriptions.list({
      customer: org.stripeCustomerId,
      status: "active",
      limit: 100,
    });

    for (const sub of subs.data) {
      await stripe.subscriptions.cancel(sub.id);
      cancelledCount++;
    }
  }

  // Clear org Stripe fields
  await prisma.organization.update({
    where: { id: org.id },
    data: { stripeCustomerId: null, stripeSubscriptionId: null },
  });

  // Deactivate all addons + clear billing info
  await prisma.orgAddon.updateMany({
    where: { organizationId: org.id },
    data: { active: false, billingInterval: null, purchaseId: null },
  });

  logger.info({ orgId: org.id, orgSlug, cancelledCount }, "[dev] Stripe customer cleaned");

  revalidatePath(`/org/${orgSlug}`);
  return `Done: ${cancelledCount} subscriptions cancelled, all addons deactivated`;
}
