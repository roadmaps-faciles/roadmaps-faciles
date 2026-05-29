import { z } from "zod";

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED",
} as const;

export const USER_ROLE = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  INHERITED: "INHERITED",
} as const;

export const userStatusEnum = z.enum(USER_STATUS);
export const userRoleEnum = z.enum(USER_ROLE);

export const User = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.email(),
  emailVerified: z.coerce.date().nullable(),
  username: z.string().nullable(),
  // Accepte URL absolue (avatars OAuth, EM en absolu) ou chemin relatif
  // (avatars uploadés via /api/uploads/avatars/<userId>/..., legacy EM en path).
  // La résolution finale est faite par `UserAvatar.resolveAvatarSrc`.
  image: z.string().nullable(),

  notificationsEnabled: z.boolean(),
  status: userStatusEnum,
  role: userRoleEnum,

  signInCount: z.number(),
  currentSignInAt: z.coerce.date().nullable(),
  lastSignInAt: z.coerce.date().nullable(),
  currentSignInIp: z.string().nullable(),
  lastSignInIp: z.string().nullable(),

  recapNotificationFrequency: z.number(),

  isBetaGouvMember: z.boolean(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof User>;
