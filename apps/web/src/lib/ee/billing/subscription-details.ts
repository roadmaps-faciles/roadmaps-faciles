import "server-only";

import type Stripe from "stripe";

import { type BillingInterval } from "./checkout";
import { stripe } from "./stripe";

export interface SubscriptionItem {
  description: null | string;
  priceId: string;
  quantity: number;
  unitAmount: number;
}

export interface SubscriptionDetail {
  cancelAtPeriodEnd: boolean;
  currency: string;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
  id: string;
  interval: BillingInterval;
  items: SubscriptionItem[];
  nextPaymentAmount: number;
  status: string;
}

function mapSubscription(sub: Stripe.Subscription): SubscriptionDetail {
  const items: SubscriptionItem[] = sub.items.data.map(item => ({
    description: item.price.nickname ?? item.price.product?.toString() ?? null,
    priceId: item.price.id,
    quantity: item.quantity ?? 1,
    unitAmount: item.price.unit_amount ?? 0,
  }));

  const nextPaymentAmount = items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
  const interval: BillingInterval = sub.items.data[0]?.price.recurring?.interval === "year" ? "yearly" : "monthly";
  const currency = sub.currency ?? sub.items.data[0]?.price.currency ?? "eur";

  const invoice = sub.latest_invoice as null | Stripe.Invoice;
  const startDate = new Date(sub.start_date * 1000);
  const estimatedEnd = new Date(startDate.getTime() + (interval === "yearly" ? 365 : 30) * 86_400_000);
  const periodStart = invoice ? new Date(invoice.period_start * 1000) : startDate;
  const periodEnd = invoice ? new Date(invoice.period_end * 1000) : estimatedEnd;

  return {
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    currency,
    currentPeriodEnd: periodEnd,
    currentPeriodStart: periodStart,
    id: sub.id,
    interval,
    items,
    nextPaymentAmount,
    status: sub.status,
  };
}

/**
 * Get the first active subscription (legacy compat).
 */
export async function getActiveSubscription(customerId: null | string): Promise<null | SubscriptionDetail> {
  const subs = await getAllActiveSubscriptions(customerId);
  return subs[0] ?? null;
}

/**
 * Get ALL active subscriptions for a Stripe customer.
 * Supports multi-interval billing (one monthly + one yearly).
 */
export async function getAllActiveSubscriptions(customerId: null | string): Promise<SubscriptionDetail[]> {
  if (!stripe || !customerId) return [];

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 10,
    expand: ["data.items.data.price", "data.latest_invoice"],
  });

  return subscriptions.data.map(mapSubscription);
}
