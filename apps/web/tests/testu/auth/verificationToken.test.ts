import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mockCreate = vi.fn();
const mockDeleteMany = vi.fn();
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    verificationToken: {
      create: mockCreate,
      deleteMany: mockDeleteMany,
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("verificationToken utils", () => {
  it("generateToken returns raw and digest", async () => {
    const { generateToken } = await import("@/lib/utils/verificationToken");
    const { raw, digest } = generateToken();

    expect(raw).toHaveLength(64); // 32 bytes hex
    expect(digest).toHaveLength(64); // sha256 hex

    // Verify digest matches raw
    const expectedDigest = createHash("sha256").update(raw).digest("hex");
    expect(digest).toBe(expectedDigest);
  });

  it("generateToken produces unique tokens", async () => {
    const { generateToken } = await import("@/lib/utils/verificationToken");
    const t1 = generateToken();
    const t2 = generateToken();
    expect(t1.raw).not.toBe(t2.raw);
    expect(t1.digest).not.toBe(t2.digest);
  });

  it("createEmailVerificationToken stores with verify: prefix", async () => {
    const { createEmailVerificationToken } = await import("@/lib/utils/verificationToken");

    await createEmailVerificationToken("test@example.com");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: "verify:test@example.com",
        }),
      }),
    );
  });

  it("createPasswordResetToken cleans existing tokens first", async () => {
    const { createPasswordResetToken } = await import("@/lib/utils/verificationToken");

    await createPasswordResetToken("test@example.com");

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { identifier: "reset:test@example.com" },
    });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          identifier: "reset:test@example.com",
        }),
      }),
    );
  });
});
