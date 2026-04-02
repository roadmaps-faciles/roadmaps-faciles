import "server-only";
import crypto from "node:crypto";

import { config } from "@/config";

interface BridgeTokenPayload {
  exp: number;
  userId: string;
}

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export const createBridgeToken = (userId: string): string => {
  const payload: BridgeTokenPayload = {
    userId,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };

  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", config.security.auth.secret).update(data).digest("base64url");

  return `${data}.${signature}`;
};

export const verifyBridgeToken = (token: string): BridgeTokenPayload => {
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

  const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as BridgeTokenPayload;

  if (Date.now() > payload.exp) {
    throw new Error("Le token bridge a expiré.");
  }

  return payload;
};
