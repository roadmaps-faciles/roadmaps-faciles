import { z } from "zod";

import { PostStatus } from "./PostStatus";

export const PostStatusChange = z.object({
  id: z.number(),
  userId: z.string(),
  postId: z.number(),
  postStatusId: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tenantId: z.number(),
});

export const PostStatusChangeWithPost = PostStatusChange.extend({
  postsStatus: z.lazy(() => PostStatus.array()),
});

export type PostStatusChange = z.infer<typeof PostStatusChange>;
export type PostStatusChangeWithPost = z.infer<typeof PostStatusChangeWithPost>;
