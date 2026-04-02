import "server-only";
import { type Session } from "next-auth";
import { forbidden, redirect } from "next/navigation";

import { type TenantSettings } from "@/lib/model/TenantSettings";
import { type OrgRole, UserRole, type UserStatus } from "@/prisma/enums";
import { getTenantFromDomain } from "@/utils/tenant";

import { logger } from "../logger";
import { auth } from "../next-auth/auth";
import { orgMemberRepo, userOnTenantRepo, userRepo } from "../repo";
import { JsonifiedError, UnexpectedSessionError } from "./error";
import { type RequireAtLeastOne, type RequireOnlyOne } from "./types";

/* ------------------------------------------------------
 * TYPES
 * ----------------------------------------------------*/

type RoleCheck = RequireOnlyOne<{ min: UserRole; only: UserRole }>;
type StatusCheck = RequireOnlyOne<{ min: UserStatus; only: UserStatus }>;

type AccessCheck = RequireAtLeastOne<{
  role: RoleCheck;
  status: StatusCheck;
}>;

type AssertParam<T> = { check: T; message?: string } | T;

type TenantAccessCheck = { domain: string } & AccessCheck;

type AssertSessionParams = {
  message?: string;
  rootUser?: AssertParam<AccessCheck>;
  tenantUser?: AssertParam<TenantAccessCheck>;
  useForbidden?: boolean;
};

/* ------------------------------------------------------
 * CONSTANTES ET HELPERS
 * ----------------------------------------------------*/

const defaultMessage = "Session non trouvée.";

const ROLE_WEIGHT: Record<UserRole, number> = {
  INHERITED: 0,
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

const STATUS_WEIGHT: Record<UserStatus, number> = {
  DELETED: 0,
  BLOCKED: 1,
  ACTIVE: 2,
};

function isAssertObj<T>(val: AssertParam<T> | undefined): val is { check: T; message?: string } {
  return typeof val === "object" && val !== null && "check" in val;
}

function fail(useForbidden: boolean, message: string): never {
  if (useForbidden) forbidden();
  const error = new JsonifiedError(new UnexpectedSessionError(message));
  logger.error({ err: error }, "Auth failure");
  throw error;
}

function roleOk(actual: UserRole, expected: RoleCheck): boolean {
  if (expected.only && expected.min) {
    throw new Error("RoleCheck ne peut pas contenir à la fois 'min' et 'only'");
  }
  return expected.only ? actual === expected.only : ROLE_WEIGHT[actual] >= ROLE_WEIGHT[expected.min];
}

function statusOk(actual: UserStatus, expected: StatusCheck): boolean {
  if (expected.only && expected.min) {
    throw new Error("StatusCheck ne peut pas contenir à la fois 'min' et 'only'");
  }
  return expected.only ? actual === expected.only : STATUS_WEIGHT[actual] >= STATUS_WEIGHT[expected.min];
}

/* ------------------------------------------------------
 * LOGIQUE D’AUTORISATION
 * ----------------------------------------------------*/

async function resolveInheritedRole(role: UserRole, userUuid: string, sessionRole?: UserRole): Promise<UserRole> {
  if (role !== "INHERITED") return role;
  if (sessionRole && sessionRole !== "INHERITED") return sessionRole;

  const user = await userRepo.findById(userUuid);
  if (!user) {
    throw new UnexpectedSessionError("Utilisateur introuvable pour rôle hérité.");
  }

  return user.role;
}

function checkRootUser(session: Session, check: AccessCheck, useForbidden: boolean, message: string) {
  const rootRole = session.user.role;
  const rootStatus = session.user.status;

  if (check.role && !roleOk(rootRole, check.role)) {
    fail(useForbidden, message);
  }

  if (check.status && !statusOk(rootStatus, check.status)) {
    fail(useForbidden, message);
  }
}

async function checkTenantUser(session: Session, check: TenantAccessCheck, useForbidden: boolean, message: string) {
  if (session.user.isSuperAdmin) return;

  const tenant = await getTenantFromDomain(check.domain);
  const userOnTenant = await userOnTenantRepo.findMembership(session.user.uuid, tenant.id);

  if (!userOnTenant) {
    fail(useForbidden, message);
  }

  const effectiveRole = await resolveInheritedRole(userOnTenant.role, session.user.uuid, session.user.role);
  const effectiveStatus = userOnTenant.status;

  if (check.role && !roleOk(effectiveRole, check.role)) {
    fail(useForbidden, message);
  }

  if (check.status && !statusOk(effectiveStatus, check.status)) {
    fail(useForbidden, message);
  }
}

/* ------------------------------------------------------
 * FONCTION PRINCIPALE
 * ----------------------------------------------------*/

/**
 * Vérifie la validité et les autorisations de la session courante.
 *
 * ## Hiérarchie d’autorité
 *   rootUser > tenantUser
 *
 * ## Usage
 * Permet de restreindre l’accès selon :
 * - le rôle et/ou le statut global du user (`rootUser`)
 * - le rôle et/ou le statut au sein du tenant courant (`tenantUser`)
 *
 * Exemple :
 * ```ts
 * await assertSession({
 *   rootUser: { check: { role: { only: "ADMIN" } } },
 * });
 *
 * await assertSession({
 *   tenantUser: {
 *     check: {
 *       role: { min: "MODERATOR" },
 *       status: { only: "ACTIVE" },
 *     },
 *     message: "Accès réservé aux membres actifs du tenant.",
 *   },
 * });
 * ```
 *
 * @param params - Paramètres de vérification.
 * @param params.rootUser - Vérifications à appliquer au user global.
 * @param params.tenantUser - Vérifications à appliquer au user dans le tenant courant.
 * @param params.message - Message d’erreur par défaut en cas d’échec. Par défaut : `"Session non trouvée."`
 * @param params.useForbidden - Si `true`, exécute `forbidden()` en cas d’échec. Sinon, lève `UnexpectedSessionError`. Par défaut : `false`.
 * @returns La `Session` si les vérifications sont passées.
 * @throws `UnexpectedSessionError` ou exécute `forbidden()` si les vérifications échouent.
 */
export const assertSession = async ({
  rootUser,
  tenantUser,
  message = defaultMessage,
  useForbidden = false,
}: AssertSessionParams = {}): Promise<Session> => {
  const session = await auth();
  if (!session?.user) {
    fail(useForbidden, message);
  }

  if (session?.user.isSuperAdmin) {
    return session; // super-admin, bypass all checks
  }

  // Extraction et normalisation des paramètres
  let rootUserToCheck: AccessCheck | null = null;
  let rootUserMessage = message;
  if (rootUser) {
    if (isAssertObj(rootUser)) {
      rootUserToCheck = rootUser.check;
      rootUserMessage = rootUser.message ?? message;
    } else {
      rootUserToCheck = rootUser;
    }
  }

  let tenantUserToCheck: null | TenantAccessCheck = null;
  let tenantUserMessage = message;
  if (tenantUser) {
    if (isAssertObj(tenantUser)) {
      tenantUserToCheck = tenantUser.check;
      tenantUserMessage = tenantUser.message ?? message;
    } else {
      tenantUserToCheck = tenantUser;
    }
  }

  // ----- PRIORITÉ : rootUser > tenantUser
  if (rootUserToCheck) {
    checkRootUser(session, rootUserToCheck, useForbidden, rootUserMessage);
    return session; // rootUser valid => skip tenant check
  }

  if (tenantUserToCheck) {
    await checkTenantUser(session, tenantUserToCheck, useForbidden, tenantUserMessage);
  }

  return session;
};

/**
 * Spécialisation d'`assertSession` pour vérifier que l'utilisateur courant est modérateur du tenant.
 *
 * @param useForbidden - Si `true`, exécute `forbidden()` en cas d'échec. Sinon, lève `UnexpectedSessionError`. Par défaut : `true`.
 * @returns La `Session` si l'utilisateur est au moins modérateur du tenant.
 * @throws `UnexpectedSessionError` ou exécute `forbidden()` si l'utilisateur n'est pas modérateur du tenant.
 */
export const assertTenantModerator = async (domain: string, useForbidden = true): Promise<Session> =>
  assertSession({ tenantUser: { check: { role: { min: UserRole.MODERATOR }, domain } }, useForbidden });

/**
 * Spécialisation d'`assertSession` pour vérifier que l'utilisateur courant est admin du tenant.
 *
 * @param useForbidden - Si `true`, exécute `forbidden()` en cas d'échec. Sinon, lève `UnexpectedSessionError`. Par défaut : `true`.
 * @returns La `Session` si l'utilisateur est admin du tenant.
 * @throws `UnexpectedSessionError` ou exécute `forbidden()` si l'utilisateur n'est pas admin du tenant.
 */
export const assertTenantAdmin = async (domain: string, useForbidden = true): Promise<Session> =>
  assertSession({ tenantUser: { check: { role: { min: UserRole.ADMIN }, domain } }, useForbidden });

/**
 * Spécialisation d’`assertSession` pour vérifier que l’utilisateur courant est admin global.
 *
 * @param useForbidden - Si `true`, exécute `forbidden()` en cas d’échec. Sinon, lève `UnexpectedSessionError`. Par défaut : `true`.
 * @returns La `Session` si l’utilisateur est admin global.
 * @throws `UnexpectedSessionError` ou exécute `forbidden()` si l’utilisateur n’est pas admin global.
 */
export const assertAdmin = async (useForbidden = true): Promise<Session> =>
  assertSession({ rootUser: { check: { role: { min: UserRole.ADMIN } } }, useForbidden });

/**
 * Spécialisation d'`assertSession` pour vérifier que l'utilisateur courant est propriétaire du tenant.
 */
export const assertTenantOwner = async (domain: string, useForbidden = true): Promise<Session> =>
  assertSession({ tenantUser: { check: { role: { only: UserRole.OWNER }, domain } }, useForbidden });

/* ------------------------------------------------------
 * ORGANISATION
 * ----------------------------------------------------*/

const ORG_ROLE_WEIGHT: Record<OrgRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

const assertOrgRole = async (orgId: number, minRole: OrgRole, useForbidden = true): Promise<Session> => {
  const session = await auth();
  if (!session?.user) {
    fail(useForbidden, defaultMessage);
  }

  if (session.user.isSuperAdmin) {
    return session;
  }

  const membership = await orgMemberRepo.findByOrgAndUser(orgId, session.user.uuid);
  if (!membership || ORG_ROLE_WEIGHT[membership.role] < ORG_ROLE_WEIGHT[minRole]) {
    fail(useForbidden, "Accès insuffisant à l'organisation.");
  }

  return session;
};

export const assertOrgMember = async (orgId: number, useForbidden = true): Promise<Session> =>
  assertOrgRole(orgId, "MEMBER", useForbidden);

export const assertOrgAdmin = async (orgId: number, useForbidden = true): Promise<Session> =>
  assertOrgRole(orgId, "ADMIN", useForbidden);

export const assertOrgOwner = async (orgId: number, useForbidden = true): Promise<Session> =>
  assertOrgRole(orgId, "OWNER", useForbidden);

/**
 * Si le site est privé et l'utilisateur non connecté, redirige vers la page de login.
 */
export const assertPublicAccess = async (settings: TenantSettings, loginPath: string): Promise<void> => {
  if (!settings.isPrivate) return;

  const session = await auth();
  if (!session?.user) {
    redirect(loginPath);
  }
};
