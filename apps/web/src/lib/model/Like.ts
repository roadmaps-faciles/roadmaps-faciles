import { z } from "zod";

import { Post } from "./Post";
import { User } from "./User";

export const Like = z.object({
  id: z.number(),
  userId: z.string().nullable(),
  anonymousId: z.string().nullable(),
  postId: z.number(),
  tenantId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const LikeWithExtra = Like.extend({
  post: Post,
  user: User.nullable(),
});

export type Like = z.infer<typeof Like>;
