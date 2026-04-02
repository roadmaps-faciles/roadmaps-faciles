import { z } from "zod";

import { localeSchema } from "@/utils/zod-schema";

export const UI_THEME = {
  Default: "Default",
  Dsfr: "Dsfr",
} as const;

export const uiThemeSchema = z.enum(UI_THEME);

export const EMAIL_REGISTRATION_POLICY = {
  ANYONE: "ANYONE",
  NOONE: "NOONE",
  DOMAINS: "DOMAINS",
} as const;

export const emailRegistrationPolicyEnum = z.enum(EMAIL_REGISTRATION_POLICY);

export const TenantSettings = z.object({
  id: z.number(),
  tenantId: z.number(),
  name: z.string(),
  subdomain: z.string(),
  customDomain: z.string().nullable(),
  locale: localeSchema,
  isPrivate: z.boolean(),
  allowVoting: z.boolean(),
  allowComments: z.boolean(),
  allowAnonymousVoting: z.boolean(),
  allowPostEdits: z.boolean(),
  allowPostDeletion: z.boolean(),
  showRoadmapInHeader: z.boolean(),
  allowAnonymousFeedback: z.boolean(),
  requirePostApproval: z.boolean(),
  allowEmbedding: z.boolean(),
  emailRegistrationPolicy: emailRegistrationPolicyEnum,
  allowedEmailDomains: z.string().array(),
  force2FA: z.boolean(),
  force2FAGraceDays: z.number(),
  uiTheme: uiThemeSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  rootBoardId: z.number().nullable(),
});

export type TenantSettings = z.infer<typeof TenantSettings>;
