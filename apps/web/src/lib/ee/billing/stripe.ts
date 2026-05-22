import "server-only";
import Stripe from "stripe";

import { config } from "@/config";

export const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, { apiVersion: "2026-04-22.dahlia" })
  : null;

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  return stripe;
}
