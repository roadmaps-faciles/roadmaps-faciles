vi.mock("@/config", () => ({
  config: {
    integrations: {
      encryptionKey: "test-secret-key-for-encryption-32chars!",
    },
  },
}));

import { decrypt, encrypt } from "@/lib/ee/integration-provider/encryption";

describe("encryption", () => {
  it("encrypt then decrypt returns original plaintext", () => {
    const plaintext = "ntn_test_api_key_12345";
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("produces salt:iv:tag:ciphertext format (4 parts)", () => {
    const encrypted = encrypt("some-text");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(4);
    // Each part should be valid base64
    for (const part of parts) {
      expect(() => Buffer.from(part, "base64")).not.toThrow();
      expect(part.length).toBeGreaterThan(0);
    }
  });

  it("two encryptions of same text produce different ciphertexts", () => {
    const plaintext = "same-key";
    const first = encrypt(plaintext);
    const second = encrypt(plaintext);
    expect(first).not.toBe(second);
    // But both decrypt to the same value
    expect(decrypt(first)).toBe(plaintext);
    expect(decrypt(second)).toBe(plaintext);
  });

  it("decrypt throws on invalid format (3 parts)", () => {
    expect(() => decrypt("a:b:c")).toThrow("Invalid encrypted value format");
  });

  it("decrypt throws on corrupted data", () => {
    const encrypted = encrypt("test");
    const parts = encrypted.split(":");
    // Corrupt the ciphertext
    parts[3] = Buffer.from("corrupted").toString("base64");
    expect(() => decrypt(parts.join(":"))).toThrow();
  });

  it("handles empty string", () => {
    const encrypted = encrypt("");
    expect(decrypt(encrypted)).toBe("");
  });

  it("handles unicode content", () => {
    const plaintext = "clé-api-avec-des-accents-éàü-🚀";
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });
});
