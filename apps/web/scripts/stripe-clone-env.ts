/**
 * Clone a Stripe environment (products, prices, coupons, promotion codes,
 * tax rates, webhook endpoints, customer portal config) from one account/mode
 * to another.
 *
 * Usage:
 *   STRIPE_SOURCE_KEY=sk_test_xxx STRIPE_TARGET_KEY=sk_test_yyy tsx scripts/stripe-clone-env.ts
 *
 * Options (env vars):
 *   STRIPE_SOURCE_KEY  - API key of the source environment (required)
 *   STRIPE_TARGET_KEY  - API key of the target environment (required)
 *   DRY_RUN=1          - preview what would be cloned without writing (optional)
 *   SKIP=webhooks,portal - comma-separated resource types to skip (optional)
 *
 * Output:
 *   Prints a JSON mapping file to stdout (old ID → new ID) at the end.
 *   Save it: ... 2>/dev/null | tee stripe-id-mapping.json
 */

import Stripe from "stripe";

const STRIPE_API_VERSION = "2026-04-22.dahlia" as const;

type ResourceType = "coupons" | "portal" | "prices" | "products" | "promotionCodes" | "taxRates" | "webhooks";

const sourceKey = process.env.STRIPE_SOURCE_KEY;
const targetKey = process.env.STRIPE_TARGET_KEY;
const dryRun = process.env.DRY_RUN === "1";
const skip = new Set<ResourceType>((process.env.SKIP ?? "").split(",").filter(Boolean) as ResourceType[]);

if (!sourceKey || !targetKey) {
  console.error("Missing STRIPE_SOURCE_KEY or STRIPE_TARGET_KEY");
  process.exit(1);
}

if (sourceKey === targetKey) {
  console.error("Source and target keys are the same - aborting to prevent duplicates.");
  process.exit(1);
}

const source = new Stripe(sourceKey, { apiVersion: STRIPE_API_VERSION });
const target = new Stripe(targetKey, { apiVersion: STRIPE_API_VERSION });

const idMap: Record<string, string> = {};

function log(icon: string, msg: string) {
  console.error(`${icon} ${msg}`);
}

// ─── Helpers ────────────────────────────────────────────

async function listAll<T>(
  resource: { list: (params: Record<string, unknown>) => Stripe.ApiListPromise<T> },
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const items: T[] = [];
  for await (const item of resource.list({ ...params, limit: 100 })) {
    items.push(item);
  }
  return items;
}

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): { [P in K]?: NonNullable<T[P]> } {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      result[key as string] = obj[key];
    }
  }
  return result as { [P in K]?: NonNullable<T[P]> };
}

// ─── Products ───────────────────────────────────────────

async function cloneProducts() {
  if (skip.has("products")) return;
  log(">>", "Cloning products...");

  const products = await listAll(source.products, { active: true });
  log("  ", `Found ${products.length} active products`);

  for (const product of products) {
    const data: Stripe.ProductCreateParams = {
      ...pick(product, ["name", "description", "metadata", "active", "statement_descriptor", "unit_label"]),
      name: product.name,
    };

    if (product.images?.length) data.images = product.images;
    if (product.tax_code) data.tax_code = typeof product.tax_code === "string" ? product.tax_code : product.tax_code.id;

    if (dryRun) {
      log("  ", `[DRY RUN] Would create product: ${product.name} (${product.id})`);
      idMap[product.id] = `dry_run_${product.id}`;
      continue;
    }

    const created = await target.products.create(data);
    idMap[product.id] = created.id;
    log("  ", `${product.name}: ${product.id} -> ${created.id}`);
  }
}

// ─── Prices ─────────────────────────────────────────────

async function clonePrices() {
  if (skip.has("prices")) return;
  log(">>", "Cloning prices...");

  const prices = await listAll(source.prices, { active: true });
  log("  ", `Found ${prices.length} active prices`);

  for (const price of prices) {
    const productId = typeof price.product === "string" ? price.product : price.product?.id;
    if (!productId) continue;

    const targetProductId = idMap[productId];
    if (!targetProductId) {
      log("  ", `Skipping price ${price.id} - product ${productId} not cloned`);
      continue;
    }

    const data: Stripe.PriceCreateParams = {
      currency: price.currency,
      product: targetProductId,
      ...pick(price, ["unit_amount", "billing_scheme", "metadata", "nickname", "tax_behavior", "lookup_key"]),
    };

    if (price.recurring) {
      data.recurring = {
        interval: price.recurring.interval,
        ...pick(price.recurring, ["interval_count", "usage_type"]),
      };
    }

    if (price.billing_scheme === "tiered" && price.tiers_mode) {
      data.tiers_mode = price.tiers_mode;
      const fullPrice = await source.prices.retrieve(price.id, { expand: ["tiers"] });
      if (fullPrice.tiers) {
        data.tiers = fullPrice.tiers.map(t => ({
          up_to: t.up_to ?? ("inf" as const),
          ...pick(t, ["unit_amount", "flat_amount"]),
        }));
      }
    }

    if (dryRun) {
      log(
        "  ",
        `[DRY RUN] Would create price: ${price.nickname || price.id} (${price.recurring?.interval || "one-time"})`,
      );
      idMap[price.id] = `dry_run_${price.id}`;
      continue;
    }

    const created = await target.prices.create(data);
    idMap[price.id] = created.id;
    log(
      "  ",
      `${price.nickname || price.id}: ${price.id} -> ${created.id} (${price.recurring?.interval || "one-time"})`,
    );
  }
}

// ─── Coupons ────────────────────────────────────────────

async function cloneCoupons() {
  if (skip.has("coupons")) return;
  log(">>", "Cloning coupons...");

  const coupons = await listAll(source.coupons);
  const activeCoupons = coupons.filter(c => c.valid);
  log("  ", `Found ${activeCoupons.length} valid coupons`);

  for (const coupon of activeCoupons) {
    const data: Stripe.CouponCreateParams = {
      ...pick(coupon, ["name", "metadata", "duration", "duration_in_months", "max_redemptions", "currency"]),
      duration: coupon.duration,
    };

    if (coupon.percent_off) data.percent_off = coupon.percent_off;
    if (coupon.amount_off) data.amount_off = coupon.amount_off;
    if (coupon.redeem_by) data.redeem_by = coupon.redeem_by;

    // Preserve custom coupon IDs (not auto-generated ones)
    if (coupon.id && !coupon.id.startsWith("Z") && coupon.id.length < 30) {
      data.id = coupon.id;
    }

    if (dryRun) {
      log("  ", `[DRY RUN] Would create coupon: ${coupon.name || coupon.id}`);
      idMap[coupon.id] = `dry_run_${coupon.id}`;
      continue;
    }

    try {
      const created = await target.coupons.create(data);
      idMap[coupon.id] = created.id;
      log("  ", `${coupon.name || coupon.id}: ${coupon.id} -> ${created.id}`);
    } catch (err) {
      log("  ", `Failed to create coupon ${coupon.id}: ${(err as Error).message}`);
    }
  }
}

// ─── Promotion Codes ────────────────────────────────────

async function clonePromotionCodes() {
  if (skip.has("promotionCodes")) return;
  log(">>", "Cloning promotion codes...");

  const promoCodes = await listAll(source.promotionCodes, { active: true });
  log("  ", `Found ${promoCodes.length} active promotion codes`);

  for (const promo of promoCodes) {
    if (promo.promotion.type !== "coupon") continue;
    const { coupon } = promo.promotion;
    const couponId = typeof coupon === "string" ? coupon : coupon?.id;
    if (!couponId) continue;

    const targetCouponId = idMap[couponId];
    if (!targetCouponId) {
      log("  ", `Skipping promo ${promo.code} - coupon ${couponId} not cloned`);
      continue;
    }

    const data: Stripe.PromotionCodeCreateParams = {
      promotion: { coupon: targetCouponId, type: "coupon" },
      code: promo.code,
      ...pick(promo, ["active", "metadata", "max_redemptions"]),
    };

    if (promo.restrictions) {
      data.restrictions = pick(promo.restrictions, [
        "first_time_transaction",
        "minimum_amount",
        "minimum_amount_currency",
      ]);
    }

    if (dryRun) {
      log("  ", `[DRY RUN] Would create promo code: ${promo.code}`);
      continue;
    }

    try {
      const created = await target.promotionCodes.create(data);
      log("  ", `${promo.code}: ${promo.id} -> ${created.id}`);
    } catch (err) {
      log("  ", `Failed to create promo ${promo.code}: ${(err as Error).message}`);
    }
  }
}

// ─── Tax Rates ──────────────────────────────────────────

async function cloneTaxRates() {
  if (skip.has("taxRates")) return;
  log(">>", "Cloning tax rates...");

  const taxRates = await listAll(source.taxRates, { active: true });
  log("  ", `Found ${taxRates.length} active tax rates`);

  for (const rate of taxRates) {
    const data: Stripe.TaxRateCreateParams = {
      display_name: rate.display_name,
      percentage: rate.percentage,
      inclusive: rate.inclusive,
      ...pick(rate, ["description", "jurisdiction", "metadata", "tax_type", "country", "state"]),
    };

    if (dryRun) {
      log("  ", `[DRY RUN] Would create tax rate: ${rate.display_name} (${rate.percentage}%)`);
      idMap[rate.id] = `dry_run_${rate.id}`;
      continue;
    }

    const created = await target.taxRates.create(data);
    idMap[rate.id] = created.id;
    log("  ", `${rate.display_name}: ${rate.id} -> ${created.id}`);
  }
}

// ─── Webhook Endpoints ──────────────────────────────────

async function cloneWebhooks() {
  if (skip.has("webhooks")) return;
  log(">>", "Cloning webhook endpoints...");

  const webhooks = await listAll(source.webhookEndpoints);
  const enabled = webhooks.filter(w => w.status !== "disabled");
  log("  ", `Found ${enabled.length} enabled webhook endpoints`);

  for (const wh of enabled) {
    const data: Stripe.WebhookEndpointCreateParams = {
      url: wh.url,
      enabled_events: wh.enabled_events as Stripe.WebhookEndpointCreateParams.EnabledEvent[],
      ...pick(wh, ["description", "metadata"]),
    };

    if (dryRun) {
      log("  ", `[DRY RUN] Would create webhook: ${wh.url}`);
      continue;
    }

    const created = await target.webhookEndpoints.create(data);
    idMap[wh.id] = created.id;
    log("  ", `${wh.url}: ${wh.id} -> ${created.id}`);
    if (created.secret) {
      log("  ", `  !! New webhook secret: ${created.secret}`);
    }
  }
}

// ─── Customer Portal ────────────────────────────────────

async function clonePortalConfig() {
  if (skip.has("portal")) return;
  log(">>", "Cloning customer portal configuration...");

  try {
    const configs = await listAll(source.billingPortal.configurations, { active: true });
    if (configs.length === 0) {
      log("  ", "No active portal configurations found");
      return;
    }

    for (const cfg of configs) {
      // Deep clone and remap product/price IDs
      const features = JSON.parse(JSON.stringify(cfg.features ?? {})) as Record<string, unknown>;

      const subUpdate = features.subscription_update as
        | { products?: Array<{ product: string; prices: string[] }> }
        | undefined;
      if (subUpdate?.products) {
        subUpdate.products = subUpdate.products.map(p => ({
          ...p,
          product: idMap[p.product] ?? p.product,
          prices: (p.prices ?? []).map(priceId => idMap[priceId] ?? priceId),
        }));
      }

      const data = {
        features,
        business_profile: pick(cfg.business_profile ?? {}, ["headline", "privacy_policy_url", "terms_of_service_url"]),
        ...pick(cfg, ["metadata", "default_return_url"]),
      } as Parameters<typeof target.billingPortal.configurations.create>[0];

      if (dryRun) {
        log("  ", `[DRY RUN] Would create portal config: ${cfg.id}`);
        continue;
      }

      const created = await target.billingPortal.configurations.create(data);
      idMap[cfg.id] = created.id;
      log("  ", `Portal config: ${cfg.id} -> ${created.id}`);
    }
  } catch (err) {
    log("  ", `Portal clone failed (may not be configured): ${(err as Error).message}`);
  }
}

// ─── Main ───────────────────────────────────────────────

async function main() {
  log(">>", `Stripe environment clone${dryRun ? " (DRY RUN)" : ""}`);
  log("  ", `Source: ${sourceKey!.slice(0, 12)}...${sourceKey!.slice(-4)}`);
  log("  ", `Target: ${targetKey!.slice(0, 12)}...${targetKey!.slice(-4)}`);
  log("  ", `Skipping: ${skip.size > 0 ? [...skip].join(", ") : "nothing"}`);
  console.error("");

  // Order matters: products before prices, coupons before promo codes
  await cloneProducts();
  await clonePrices();
  await cloneCoupons();
  await clonePromotionCodes();
  await cloneTaxRates();
  await cloneWebhooks();
  await clonePortalConfig();

  console.error("");
  log("OK", `Done! ${Object.keys(idMap).length} resources mapped.`);

  // Output mapping to stdout (pipe to file)
  console.log(JSON.stringify(idMap, null, 2));
}

main().catch((err: Error) => {
  console.error(`\nFatal: ${err.message}`);
  process.exit(1);
});
