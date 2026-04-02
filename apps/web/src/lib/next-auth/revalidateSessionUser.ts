import { type UserRole, type UserStatus } from "@/prisma/enums";

type SessionUser = {
  uuid: string;
};

type FreshUserData = {
  email: string;
  isBetaGouvMember: boolean;
  name: null | string;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
  username: null | string;
};

export type RevalidatedUserFields = {
  email: string;
  isBetaGouvMember: boolean;
  isSuperAdmin: boolean;
  name: null | string;
  role: UserRole;
  status: UserStatus;
  twoFactorEnabled: boolean;
};

/**
 * Re-validate user against DB on every request.
 * - Returns updated user fields if user is ACTIVE
 * - Returns `null` if user is gone, DELETED, or BLOCKED (session should be invalidated)
 * - Returns `undefined` on DB error (fail-open: keep existing token)
 */
export async function revalidateSessionUser(
  user: SessionUser,
  findById: (id: string) => Promise<FreshUserData | null>,
  adminUsernames: string[],
): Promise<null | RevalidatedUserFields | undefined> {
  try {
    const freshUser = await findById(user.uuid);
    if (!freshUser || freshUser.status === "DELETED" || freshUser.status === "BLOCKED") {
      return null;
    }
    return {
      role: freshUser.role,
      status: freshUser.status,
      name: freshUser.name,
      email: freshUser.email,
      twoFactorEnabled: freshUser.twoFactorEnabled,
      isBetaGouvMember: freshUser.isBetaGouvMember,
      isSuperAdmin: freshUser.username ? adminUsernames.includes(freshUser.username) : false,
    };
  } catch {
    return undefined;
  }
}
