"use server";

import { EspaceMembreProvider } from "@incubateur-ademe/next-auth-espace-membre-provider";
import { EspaceMembreClientMemberNotFoundError } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";

import { prisma } from "@/lib/db/prisma";
import { espaceMembreProvider } from "@/lib/next-auth/auth";
import { audit, AuditAction, getRequestContext } from "@/utils/audit";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

// Même provider que le login mais explicitement sans cache. Comparer le résultat des deux
// clients (login = `cache: default`/`revalidate: 300`, celui-ci = `no-store`) révèle si le
// cache fetch de Next empoisonne la résolution en prod : un 404 côté cache + 200 côté fresh
// pointerait directement le cache.
const freshEspaceMembreProvider = EspaceMembreProvider({
  fetch,
  fetchOptions: { cache: "no-store" },
});

export type EmTestCallStatus = "error" | "found" | "notFound";

export interface EmTestCall {
  communicationEmail?: string;
  durationMs: number;
  errorMessage?: string;
  errorName?: string;
  isActive?: boolean;
  resolvedLoginEmail?: string;
  role?: string;
  status: EmTestCallStatus;
  username?: string;
}

export interface DbUserInfo {
  exists: boolean;
  hasOtpSecret?: boolean;
  hasOtpVerifiedAt?: boolean;
  idHint?: string;
  twoFactorEnabled?: boolean;
  username?: null | string;
}

export interface EmTestResult {
  cached: EmTestCall;
  dbByEmail?: DbUserInfo;
  dbByUsername?: DbUserInfo;
  dbError?: string;
  dbSameUser?: boolean | null;
  endpointUrl: string;
  fresh: EmTestCall;
  identifierSent: string;
}

const redactEmail = (value: string): string => {
  const at = value.indexOf("@");
  if (at <= 0) return "***";
  return `${value[0]}***@${value.slice(at + 1)}`;
};

const redactErrorMessage = (message: string): string =>
  message.replace(/[\w.+-]+@[\w.-]+/g, match => `${match[0]}***@${match.split("@")[1] ?? ""}`);

const runCall = async (client: (typeof espaceMembreProvider)["client"], identifier: string): Promise<EmTestCall> => {
  const start = Date.now();
  try {
    const member = await client.member.getByUsername(identifier);
    const loginEmail = member.communication_email === "primary" ? member.primary_email : member.secondary_email;
    return {
      status: "found",
      isActive: member.isActive,
      username: member.username,
      role: member.role,
      communicationEmail: member.communication_email,
      resolvedLoginEmail: loginEmail ? redactEmail(loginEmail) : undefined,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    if (error instanceof EspaceMembreClientMemberNotFoundError) {
      return { status: "notFound", durationMs: Date.now() - start };
    }
    return {
      status: "error",
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? redactErrorMessage(error.message) : String(error),
      durationMs: Date.now() - start,
    };
  }
};

const toDbUserInfo = (
  user: {
    id: string;
    otpSecret: null | string;
    otpVerifiedAt: Date | null;
    twoFactorEnabled: boolean;
    username: null | string;
  } | null,
): DbUserInfo =>
  user
    ? {
        exists: true,
        hasOtpSecret: !!user.otpSecret,
        hasOtpVerifiedAt: !!user.otpVerifiedAt,
        twoFactorEnabled: user.twoFactorEnabled,
        idHint: user.id.slice(0, 8),
        username: user.username,
      }
    : { exists: false };

export const testEspaceMembreLogin = async (identifier: string): Promise<ServerActionResponse<EmTestResult>> => {
  await assertAdmin();

  const identifierSent = identifier.trim();
  if (!identifierSent) return { ok: false, error: "empty" };

  const [cached, fresh] = await Promise.all([
    runCall(espaceMembreProvider.client, identifierSent),
    runCall(freshEspaceMembreProvider.client, identifierSent),
  ]);

  // Diagnostic DB : le bloc OTP pré-login (auth.ts) cherche l'utilisateur PAR EMAIL résolu,
  // alors que le pré-check OTP du formulaire cherche PAR USERNAME. Un row trouvé par email
  // avec OTP configuré (et introuvable par username) fait renvoyer false à signIn → AccessDenied.
  const select = { id: true, otpSecret: true, otpVerifiedAt: true, twoFactorEnabled: true, username: true } as const;
  let dbByUsername: DbUserInfo | undefined;
  let dbByEmail: DbUserInfo | undefined;
  let dbSameUser: boolean | null | undefined;
  let dbError: string | undefined;
  try {
    let resolvedEmail: string | undefined;
    try {
      const member = await espaceMembreProvider.client.member.getByUsername(identifierSent);
      resolvedEmail = member.communication_email === "primary" ? member.primary_email : member.secondary_email;
    } catch {
      resolvedEmail = undefined;
    }

    const [byUsername, byEmail] = await Promise.all([
      prisma.user.findFirst({ where: { username: identifierSent }, select }),
      resolvedEmail ? prisma.user.findFirst({ where: { email: resolvedEmail }, select }) : Promise.resolve(null),
    ]);

    dbByUsername = toDbUserInfo(byUsername);
    dbByEmail = toDbUserInfo(byEmail);
    dbSameUser = byUsername && byEmail ? byUsername.id === byEmail.id : null;
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
  }

  return {
    ok: true,
    data: {
      identifierSent,
      endpointUrl: process.env.ESPACE_MEMBRE_URL || "https://espace-membre.incubateur.net",
      cached,
      fresh,
      dbByUsername,
      dbByEmail,
      dbSameUser,
      dbError,
    },
  };
};

// Rattachement manuel : backfille le `username` beta.gouv (+ isBetaGouvMember) sur un compte
// existant trouvé par email, pour qu'il puisse se connecter via l'Espace Membre. Version
// manuelle de Fix A, pour débloquer un compte à la demande depuis l'admin.
export const linkEspaceMembreAccount = async (identifier: string): Promise<ServerActionResponse> => {
  const session = await assertAdmin();
  const reqCtx = await getRequestContext();

  const id = identifier.trim();
  if (!id) return { ok: false, error: "empty" };

  const member = await espaceMembreProvider.client.member.getByUsername(id).catch(() => null);
  if (!member) return { ok: false, error: "memberNotFound" };
  if (!member.isActive) return { ok: false, error: "memberInactive" };

  const email = member.communication_email === "primary" ? member.primary_email : member.secondary_email;
  if (!email) return { ok: false, error: "noEmail" };

  const user = await prisma.user.findFirst({ where: { email }, select: { id: true, username: true } });
  if (!user) return { ok: false, error: "noUser" };
  if (user.username === member.username) return { ok: true };
  if (user.username) return { ok: false, error: "usernameConflict" };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { username: member.username, isBetaGouvMember: true },
    });
  } catch (error) {
    // P2002 = violation de contrainte d'unicité (username déjà pris). Toute autre erreur
    // (DB/transitoire) ne doit pas être maquillée en conflit d'unicité : on la distingue
    // pour que l'audit et la réponse reflètent la vraie cause.
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: unknown }).code : undefined;
    const reason = code === "P2002" ? "usernameTaken" : "updateFailed";
    audit(
      {
        action: AuditAction.ROOT_USER_UPDATE,
        success: false,
        error: reason,
        userId: session.user.uuid,
        targetType: "User",
        targetId: user.id,
      },
      reqCtx,
    );
    return { ok: false, error: reason };
  }

  audit(
    {
      action: AuditAction.ROOT_USER_UPDATE,
      success: true,
      userId: session.user.uuid,
      targetType: "User",
      targetId: user.id,
      metadata: { linkedEspaceMembreUsername: member.username },
    },
    reqCtx,
  );
  return { ok: true };
};
