import "server-only";
import { EspaceMembreClient, type Member } from "@incubateur-ademe/next-auth-espace-membre-provider/EspaceMembreClient";
import crypto from "node:crypto";

import { config } from "@/config";

export const espaceMembreClient = new EspaceMembreClient({
  apiKey: config.espaceMembre.apiKey,
  endpointUrl: config.espaceMembre.url,
});

export const getEmUserEmail = (member: Member): string =>
  member.communication_email === "secondary" ? member.secondary_email : member.primary_email;

interface EmLinkTokenPayload {
  emUsername: string;
  exp: number;
  redirectUrl: string;
  userId: string;
}

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export const createEmLinkToken = (userId: string, emUsername: string, redirectUrl: string): string => {
  const payload: EmLinkTokenPayload = {
    userId,
    emUsername,
    redirectUrl,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };

  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", config.security.auth.secret).update(data).digest("base64url");

  return `${data}.${signature}`;
};

export const verifyEmLinkToken = (token: string): EmLinkTokenPayload => {
  const [data, signature] = token.split(".");
  if (!data || !signature) {
    throw new Error("Token invalide.");
  }

  const expectedSignature = crypto.createHmac("sha256", config.security.auth.secret).update(data).digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error("Token invalide.");
  }

  const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as EmLinkTokenPayload;

  if (Date.now() > payload.exp) {
    throw new Error("Le lien de vérification a expiré.");
  }

  return payload;
};
