import { z } from "zod";

export const POST_APPROVAL_STATUS = {
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
} as const;

export const DEFAULT_POST_APPROVAL_STATUS = POST_APPROVAL_STATUS.APPROVED;
// TODO: i18n
export const POST_APPROVAL_STATUS_LABELS = {
  [POST_APPROVAL_STATUS.APPROVED]: "Approuvé",
  [POST_APPROVAL_STATUS.PENDING]: "En attente",
  [POST_APPROVAL_STATUS.REJECTED]: "Rejeté",
};

export type PostApprovalStatus = keyof typeof POST_APPROVAL_STATUS;

export const postApprovalStatusEnum = z.enum(POST_APPROVAL_STATUS).default(POST_APPROVAL_STATUS.APPROVED);

export const Post = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  boardId: z.number(),
  postStatusId: z.number().nullable(),
  tenantId: z.number(),
  userId: z.string().nullable(),
  anonymousId: z.string().nullable(),
  slug: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  editedAt: z.coerce.date().nullable(),
  editedById: z.string().nullable(),
  approvalStatus: postApprovalStatusEnum,
  tags: z.string().array(),
});

export type Post = z.infer<typeof Post>;
