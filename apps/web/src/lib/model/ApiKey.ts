import { z } from "zod";

export const ApiKey = z.object({
  id: z.number(),
  tenantId: z.number(),
  userId: z.string(),
  commonTokenPrefix: z.string(),
  randomTokenPrefix: z.string(),
  tokenDigest: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ApiKey = z.infer<typeof ApiKey>;
