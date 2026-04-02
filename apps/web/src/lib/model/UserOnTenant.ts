import { z } from "zod";

import { userRoleEnum, userStatusEnum } from "./User";

export const UserOnTenant = z.object({
  userId: z.string(),
  tenantId: z.number(),
  status: userStatusEnum,
  role: userRoleEnum,
  joinedAt: z.coerce.date(),
});

export type UserOnTenant = z.infer<typeof UserOnTenant>;
