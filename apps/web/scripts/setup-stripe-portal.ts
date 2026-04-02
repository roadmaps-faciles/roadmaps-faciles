/**
 * One-time script to configure the Stripe Customer Portal.
 *
 * Usage: pnpm run-script setup-stripe-portal.ts
 *
 * This configures what customers can do in the self-service portal
 * (manage subscription, update billing info, view invoices, etc.).
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is required");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://roadmaps-faciles.fr";

async function main() {
  console.log("Configuring Stripe Customer Portal...\n");

  const config = await stripe.billingPortal.configurations.create({
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: {
        enabled: true,
        allowed_updates: ["email", "address", "tax_id"],
      },
      subscription_cancel: {
        enabled: true,
        mode: "at_period_end",
        cancellation_reason: {
          enabled: true,
          options: ["too_expensive", "missing_features", "switched_service", "unused", "other"],
        },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "create_prorations",
      },
    },
    business_profile: {
      headline: "Roadmaps Faciles — Gérer votre abonnement",
      privacy_policy_url: `${SITE_URL}/politique-de-confidentialite`,
      terms_of_service_url: `${SITE_URL}/cgu`,
    },
    default_return_url: `${SITE_URL}`,
  });

  console.log("✅ Customer Portal configured");
  console.log(`   ID: ${config.id}`);
  console.log(`   Is default: ${config.is_default}`);
  console.log(`   Features:`);
  console.log(`     - Invoice history: ${config.features.invoice_history.enabled}`);
  console.log(`     - Payment method update: ${config.features.payment_method_update.enabled}`);
  console.log(`     - Customer update (email, address, tax_id): ${config.features.customer_update.enabled}`);
  console.log(`     - Subscription cancel (at period end): ${config.features.subscription_cancel.enabled}`);
  console.log(`     - Subscription update (price): ${config.features.subscription_update.enabled}`);
}

main().catch(err => {
  console.error("Failed to configure portal:", err);
  process.exit(1);
});
