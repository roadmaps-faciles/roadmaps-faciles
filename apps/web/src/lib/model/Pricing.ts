import { type AddonType } from "./Organization";

/**
 * Base features included for free in every plan.
 */
export const BASE_FEATURES = [
  "roadmap",
  "boards",
  "votes",
  "comments",
  "embed",
  "imageUpload",
  "magicLink",
  "passwordAuth",
  "oauthProviders",
  "storageS3",
] as const;

export type BaseFeature = (typeof BASE_FEATURES)[number];

/**
 * Addon packs — grouped by value proposition.
 * Each pack maps to a single Stripe Price ID.
 * When purchased, all addons in the pack are activated individually in OrgAddon.
 *
 * Prices are monthly in euros (indicative — actual billing via Stripe).
 */
export interface AddonPack {
  addons: AddonType[];
  id: string;
  monthlyPrice: number;
}

export const ADDON_PACKS: AddonPack[] = [
  {
    id: "customDomain",
    addons: ["CUSTOM_DOMAIN", "DNS_MANAGEMENT"],
    monthlyPrice: 5,
  },
  {
    id: "multiTenant",
    addons: ["MULTI_TENANT"],
    monthlyPrice: 9,
  },
  {
    id: "integrations",
    addons: ["INTEGRATIONS", "CRON_JOBS"],
    monthlyPrice: 9,
  },
  {
    id: "apiWebhooks",
    addons: ["API_KEYS", "WEBHOOKS"],
    monthlyPrice: 9,
  },
  {
    id: "auditCompliance",
    addons: ["AUDIT_LOG", "TWO_FACTOR_ENTERPRISE"],
    monthlyPrice: 9,
  },
  {
    id: "analytics",
    addons: ["TRACKING"],
    monthlyPrice: 3,
  },
  {
    id: "ssoEnterprise",
    addons: ["SSO_ENTERPRISE"],
    monthlyPrice: 15,
  },
];

/**
 * Bundle pricing — all packs at a discount.
 * Bundles are also Stripe Price IDs (one line item, not multiple packs).
 */
export const BUNDLE_PRO = {
  id: "bundlePro",
  packs: ADDON_PACKS.filter(p => p.id !== "ssoEnterprise").map(p => p.id),
  monthlyPrice: 39,
} as const;

export const BUNDLE_COMPLETE = {
  id: "bundleComplete",
  packs: ADDON_PACKS.map(p => p.id),
  monthlyPrice: 49,
} as const;

/**
 * Resolve a pack or bundle ID into the list of individual addons to activate.
 */
export function resolveAddonsForPurchase(purchaseId: string): AddonType[] {
  // Check bundles first
  if (purchaseId === BUNDLE_PRO.id) {
    return ADDON_PACKS.filter(p => BUNDLE_PRO.packs.includes(p.id)).flatMap(p => p.addons);
  }
  if (purchaseId === BUNDLE_COMPLETE.id) {
    return ADDON_PACKS.flatMap(p => p.addons);
  }

  // Check individual packs
  const pack = ADDON_PACKS.find(p => p.id === purchaseId);
  if (pack) return [...pack.addons];

  return [];
}

/**
 * All purchasable items (packs + bundles) for Stripe Price ID mapping.
 */
export const ALL_PURCHASABLE_IDS = [...ADDON_PACKS.map(p => p.id), BUNDLE_PRO.id, BUNDLE_COMPLETE.id] as const;

export type PurchasableId = (typeof ALL_PURCHASABLE_IDS)[number];
