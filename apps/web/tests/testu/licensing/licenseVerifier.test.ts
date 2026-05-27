import { createPrivateKey, generateKeyPairSync, sign } from "node:crypto";

import { type LicensePayload } from "@/lib/ee/licensing/types";

// Generate a fresh test keypair - NOT the production keys
const { privateKey: testPrivateKey, publicKey: testPublicKey } = generateKeyPairSync("ed25519");
const testPublicKeyB64 = testPublicKey.export({ format: "der", type: "spki" }).toString("base64");
const testPrivateKeyB64 = testPrivateKey.export({ format: "der", type: "pkcs8" }).toString("base64");

// Mock the public key to use our test key
vi.mock("@/lib/ee/licensing/publicKey", () => ({
  LICENSING_PUBLIC_KEY: testPublicKeyB64,
}));

// Mock server-only (not available in test env)
vi.mock("server-only", () => ({}));

function signTestKey(payload: LicensePayload): string {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadJson).toString("base64url");

  const pk = createPrivateKey({
    key: Buffer.from(testPrivateKeyB64, "base64"),
    format: "der",
    type: "pkcs8",
  });

  const signature = sign(null, Buffer.from(payloadJson), pk);
  const signatureB64 = signature.toString("base64url");

  return `rf_live_${payloadB64}.${signatureB64}`;
}

const validPayload: LicensePayload = {
  licenseId: "test-license-id",
  plan: "LICENSED",
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
};

const expiredPayload: LicensePayload = {
  licenseId: "test-expired",
  plan: "LICENSED",
  expiresAt: new Date("2020-01-01").toISOString(),
};

describe("licenseVerifier", () => {
  let parseLicenseKey: typeof import("@/lib/ee/licensing/licenseVerifier").parseLicenseKey;
  let isLicenseExpired: typeof import("@/lib/ee/licensing/licenseVerifier").isLicenseExpired;

  beforeAll(async () => {
    const mod = await import("@/lib/ee/licensing/licenseVerifier");
    parseLicenseKey = mod.parseLicenseKey;
    isLicenseExpired = mod.isLicenseExpired;
  });

  describe("parseLicenseKey", () => {
    it("returns valid=true for a correctly signed key", () => {
      const key = signTestKey(validPayload);
      const result = parseLicenseKey(key);
      expect(result.valid).toBe(true);
      expect(result.payload).toMatchObject({
        licenseId: "test-license-id",
        plan: "LICENSED",
      });
    });

    it("returns valid=false for a tampered payload", () => {
      const key = signTestKey(validPayload);
      // Tamper: change first char of payload section
      const parts = key.split(".");
      const tampered = `rf_live_X${parts[0].slice("rf_live_X".length)}.${parts[1]}`;
      const result = parseLicenseKey(tampered);
      expect(result.valid).toBe(false);
    });

    it("returns valid=false for invalid format (no rf_live_ prefix)", () => {
      const result = parseLicenseKey("invalid_key_format");
      expect(result.valid).toBe(false);
      expect(result.payload).toBeNull();
    });

    it("returns valid=false for missing dot separator", () => {
      const result = parseLicenseKey("rf_live_payloadonly");
      expect(result.valid).toBe(false);
    });

    it("returns valid=false for invalid base64 payload", () => {
      const result = parseLicenseKey("rf_live_!!!invalid.sig");
      expect(result.valid).toBe(false);
    });

    it("returns valid=false for a key signed with a different private key", () => {
      const { privateKey: otherPrivate } = generateKeyPairSync("ed25519");
      const payloadJson = JSON.stringify(validPayload);
      const payloadB64 = Buffer.from(payloadJson).toString("base64url");
      const signature = sign(null, Buffer.from(payloadJson), otherPrivate);
      const signatureB64 = signature.toString("base64url");
      const key = `rf_live_${payloadB64}.${signatureB64}`;

      const result = parseLicenseKey(key);
      expect(result.valid).toBe(false);
    });

    it("parses GOV_LICENSED plan correctly", () => {
      const govPayload: LicensePayload = { ...validPayload, plan: "GOV_LICENSED" };
      const key = signTestKey(govPayload);
      const result = parseLicenseKey(key);
      expect(result.valid).toBe(true);
      expect(result.payload?.plan).toBe("GOV_LICENSED");
    });
  });

  describe("isLicenseExpired", () => {
    it("returns false for a future expiry", () => {
      expect(isLicenseExpired(validPayload)).toBe(false);
    });

    it("returns true for a past expiry", () => {
      expect(isLicenseExpired(expiredPayload)).toBe(true);
    });
  });
});
