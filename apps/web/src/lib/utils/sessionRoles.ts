import { USER_ROLE } from "@/lib/model/User";

/** Minimal session user shape needed for role checks. */
interface SessionUserLike {
  currentTenantRole?: string;
  isSuperAdmin?: boolean;
  role: string;
}

/** Check if the session user has admin-level access (root or tenant). */
export function isSessionAdmin(user: SessionUserLike): boolean {
  return (
    user.role === USER_ROLE.ADMIN ||
    user.role === USER_ROLE.OWNER ||
    !!user.isSuperAdmin ||
    user.currentTenantRole === USER_ROLE.ADMIN ||
    user.currentTenantRole === USER_ROLE.OWNER
  );
}

/** Check if the session user has at least moderator-level access. */
export function isSessionModerator(user: SessionUserLike): boolean {
  return isSessionAdmin(user) || user.currentTenantRole === USER_ROLE.MODERATOR;
}
