import { z } from "zod";

export const Follow = z.object({
  id: z.number(),
  userId: z.string(),
  postId: z.number(),
  tenantId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Follow = z.infer<typeof Follow>;
