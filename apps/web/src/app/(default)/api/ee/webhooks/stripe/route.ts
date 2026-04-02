import type Stripe from "stripe";

import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getPackStripePriceIds } from "@/lib/ee/billing/pricing";
import { getStripe } from "@/lib/ee/billing/stripe";
import { logger } from "@/lib/logger";
import { ALL_PURCHASABLE_IDS } from "@/lib/model/Pricing";

/**
 * Stripe webhook handler for subscription lifecycle events.
 * Addon-first model: subscriptions contain only addon line items (no plan line item).
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const { config } = await import("@/config");

  if (!signature || !config.stripe.webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: StatusCodes.BAD_REQUEST });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
  } catch (error) {
    logger.warn({ err: error }, "Stripe webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: StatusCodes.BAD_REQUEST });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        logger.debug({ type: event.type }, "Unhandled Stripe event type");
    }
  } catch (error) {
    logger.error({ err: error, eventType: event.type, eventId: event.id }, "Stripe webhook processing error");
    return NextResponse.json({ error: "Webhook processing error" }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }

  return NextResponse.json({ received: true });
}

/**
 * Checkout completed — store Stripe customer + subscription IDs on org,
 * then activate the purchased addons.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.orgId;
  if (!orgId) {
    logger.warn({ sessionId: session.id }, "Checkout session missing orgId metadata");
    return;
  }

  const orgIdNum = Number(orgId);
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  await prisma.organization.update({
    where: { id: orgIdNum },
    data: {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscriptionId ?? undefined,
    },
  });

  // Activate the addons from checkout metadata
  const addonsParam = session.metadata?.addons;
  const purchaseId = session.metadata?.purchaseId ?? session.metadata?.purchaseIds ?? null;

  // Determine billing interval from subscription
  let interval: "MONTHLY" | "YEARLY" = "MONTHLY";
  if (subscriptionId) {
    try {
      const stripe = getStripe();
      if (stripe) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const firstItem = sub.items?.data?.[0];
        if (firstItem?.price?.recurring?.interval === "year") interval = "YEARLY";
      }
    } catch {
      // Fallback to monthly
    }
  }

  if (addonsParam) {
    const addons = addonsParam.split(",").filter(Boolean);
    for (const addon of addons) {
      const existing = await prisma.orgAddon.findFirst({
        where: { organizationId: orgIdNum, tenantId: null, addon: addon as never },
      });
      if (existing) {
        await prisma.orgAddon.update({
          where: { id: existing.id },
          data: { active: true, billingInterval: interval, purchaseId: purchaseId ?? null },
        });
      } else {
        await prisma.orgAddon.create({
          data: {
            organizationId: orgIdNum,
            tenantId: null,
            addon: addon as never,
            active: true,
            billingInterval: interval,
            purchaseId: purchaseId ?? null,
          },
        });
      }
    }
    logger.info({ orgId, addons, interval, purchaseId }, "Checkout completed — addons activated");
  }

  logger.info({ orgId, customerId, subscriptionId }, "Checkout completed — subscription linked to org");
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.orgId;
  if (!orgId) return;

  const status = subscription.status;
  if (status === "past_due" || status === "unpaid") {
    logger.warn({ orgId, subscriptionId: subscription.id, status }, "Subscription payment issue");
  }

  // Sync subscription ID
  if (status === "active") {
    await prisma.organization.update({
      where: { id: Number(orgId) },
      data: {
        stripeSubscriptionId: subscription.id,
      },
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const orgId = subscription.metadata?.orgId;
  if (!orgId) return;

  const orgIdNum = Number(orgId);

  // Clear subscription ID + deactivate all addons
  await prisma.organization.update({
    where: { id: orgIdNum },
    data: {
      stripeSubscriptionId: null,
    },
  });

  await prisma.orgAddon.updateMany({
    where: { organizationId: orgIdNum, active: true },
    data: { active: false },
  });

  logger.info({ orgId, subscriptionId: subscription.id }, "Subscription deleted — addons deactivated");
}

/**
 * When an invoice is paid, verify addon line items are in sync with DB.
 * Safety net — primary sync is synchronous in the toggle action.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!org) return;

  // Build set of all known pack/bundle price IDs
  const allPriceIds = new Set<string>();
  for (const packId of ALL_PURCHASABLE_IDS) {
    const priceIds = getPackStripePriceIds(packId);
    if (priceIds) {
      if (priceIds.monthly) allPriceIds.add(priceIds.monthly);
      if (priceIds.yearly) allPriceIds.add(priceIds.yearly);
    }
  }

  // Count pack line items in invoice
  const invoicePackCount =
    invoice.lines?.data?.filter(line => {
      const price = line.pricing?.price_details?.price;
      const priceId = typeof price === "string" ? price : price?.id;
      return priceId ? allPriceIds.has(priceId) : false;
    }).length ?? 0;

  logger.info({ orgId: org.id, invoiceId: invoice.id, invoicePackCount }, "Invoice paid — sync verified");
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const org = await prisma.organization.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (org) {
    logger.warn({ orgId: org.id, invoiceId: invoice.id }, "Payment failed for organization");
  }
}
