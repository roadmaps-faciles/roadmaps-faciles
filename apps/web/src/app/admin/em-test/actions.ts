"use server";

import { EspaceMembreProvider } from "@incubateur-ademe/next-auth-espace-membre-provider";
import { EspaceMembreClientMemberNotFoundError } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";

import { espaceMembreProvider } from "@/lib/next-auth/auth";
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

export interface EmTestResult {
  cached: EmTestCall;
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

export const testEspaceMembreLogin = async (identifier: string): Promise<ServerActionResponse<EmTestResult>> => {
  await assertAdmin();

  const identifierSent = identifier.trim();
  if (!identifierSent) return { ok: false, error: "empty" };

  const [cached, fresh] = await Promise.all([
    runCall(espaceMembreProvider.client, identifierSent),
    runCall(freshEspaceMembreProvider.client, identifierSent),
  ]);

  return {
    ok: true,
    data: {
      identifierSent,
      endpointUrl: process.env.ESPACE_MEMBRE_URL || "https://espace-membre.incubateur.net",
      cached,
      fresh,
    },
  };
};
