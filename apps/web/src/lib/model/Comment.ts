import { z } from "zod";

export const Comment = z.object({
  id: z.number(),
  body: z.string().nullable(),
  userId: z.string(),
  postId: z.number(),
  parentId: z.number().nullable(),
  isPostUpdate: z.boolean(),
  tenantId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Comment = z.infer<typeof Comment>;
