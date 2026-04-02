import { z } from "zod";

import { TenantSettings } from "./TenantSettings";

export const Tenant = z.object({
  id: z.number(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const TenantWithSettings = Tenant.extend({
  settings: TenantSettings,
});

export type Tenant = z.infer<typeof Tenant>;
export type TenantWithSettings = z.infer<typeof TenantWithSettings>;
