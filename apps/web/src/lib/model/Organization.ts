import { z } from "zod";

export const ORG_PLAN = {
  BASE: "BASE",
  GOV: "GOV",
  GRANTED_FREE: "GRANTED_FREE",
} as const;

export type OrgPlan = keyof typeof ORG_PLAN;

export const ORG_ROLE = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  OWNER: "OWNER",
} as const;

export type OrgRole = keyof typeof ORG_ROLE;

export const ADDON_TYPE = {
  API_KEYS: "API_KEYS",
  AUDIT_LOG: "AUDIT_LOG",
  CRON_JOBS: "CRON_JOBS",
  CUSTOM_DOMAIN: "CUSTOM_DOMAIN",
  DNS_MANAGEMENT: "DNS_MANAGEMENT",
  INTEGRATIONS: "INTEGRATIONS",
  MULTI_TENANT: "MULTI_TENANT",
  SSO_ENTERPRISE: "SSO_ENTERPRISE",
  STORAGE_S3: "STORAGE_S3",
  THEME_DSFR: "THEME_DSFR",
  TRACKING: "TRACKING",
  TWO_FACTOR_ENTERPRISE: "TWO_FACTOR_ENTERPRISE",
  WEBHOOKS: "WEBHOOKS",
} as const;

export type AddonType = keyof typeof ADDON_TYPE;

export const orgPlanEnum = z.enum(ORG_PLAN);
export const orgRoleEnum = z.enum(ORG_ROLE);
export const addonTypeEnum = z.enum(ADDON_TYPE);

export const OrganizationInput = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
});

export type OrganizationInput = z.infer<typeof OrganizationInput>;
