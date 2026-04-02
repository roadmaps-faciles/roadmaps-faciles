import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

import { config } from "@/config";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(salt: Buffer): Buffer {
  const secret = config.integrations.encryptionKey;
  if (!secret) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY is required for integration credentials encryption");
  }
  return scryptSync(secret, salt, KEY_LENGTH);
}

export function encrypt(plaintext: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: salt:iv:tag:ciphertext (all base64)
  return [salt, iv, tag, encrypted].map(b => b.toString("base64")).join(":");
}

export function decrypt(encoded: string): string {
  const parts = encoded.split(":");
  if (parts.length !== 4) {
    throw new Error("Invalid encrypted value format");
  }

  const [saltB64, ivB64, tagB64, ciphertextB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");
  const key = deriveKey(salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
