import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("password utils", () => {
  it("hashPassword returns a valid argon2 hash", async () => {
    const { hashPassword } = await import("@/lib/utils/password");
    const hash = await hashPassword("testPassword123");
    expect(hash).toMatch(/^\$argon2/);
  });

  it("verifyPassword returns true for correct password", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/utils/password");
    const hash = await hashPassword("mySecurePassword");
    const result = await verifyPassword(hash, "mySecurePassword");
    expect(result).toBe(true);
  });

  it("verifyPassword returns false for wrong password", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/utils/password");
    const hash = await hashPassword("correctPassword");
    const result = await verifyPassword(hash, "wrongPassword");
    expect(result).toBe(false);
  });

  it("produces different hashes for same password (salt)", async () => {
    const { hashPassword } = await import("@/lib/utils/password");
    const hash1 = await hashPassword("samePassword");
    const hash2 = await hashPassword("samePassword");
    expect(hash1).not.toBe(hash2);
  });
});
