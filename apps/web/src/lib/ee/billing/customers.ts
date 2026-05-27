import "server-only";

import { prisma } from "@/lib/db/prisma";
import { type Organization } from "@/prisma/client";

import { getStripe } from "./stripe";

/**
 * Create a Stripe Customer for an Organization and persist the ID.
 * Requires Stripe to be configured - callers must guard with `stripe` check first.
 */
export async function createStripeCustomer(org: Organization): Promise<string> {
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    name: org.name,
    metadata: { orgId: String(org.id), orgSlug: org.slug },
  });
  await prisma.organization.update({
    where: { id: org.id },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

/**
 * Sync Stripe Customer metadata with Organization data.
 */
export async function syncStripeCustomer(org: Organization): Promise<void> {
  if (!org.stripeCustomerId) return;
  const stripe = getStripe();
  await stripe.customers.update(org.stripeCustomerId, {
    name: org.name,
    metadata: { orgId: String(org.id), orgSlug: org.slug },
  });
}

/**
 * Get or create a Stripe Customer for an Organization.
 * Returns the customer ID.
 */
export async function getOrCreateCustomer(org: Organization): Promise<string> {
  if (org.stripeCustomerId) return org.stripeCustomerId;
  return createStripeCustomer(org);
}
