import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    verificationToken: {
      create: vi.fn(),
    },
  },
}));

const mockFindByEmail = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/lib/repo/IUserRepo", () => ({}));

describe("SignupWithPassword", () => {
  const fakeUserRepo = {
    findByEmail: mockFindByEmail,
    create: mockCreate,
    findAll: vi.fn(),
    findAllWithTenantCount: vi.fn(),
    findById: vi.fn(),
    findByUsername: vi.fn(),
    searchByEmail: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a user with hashed password and returns verification token", async () => {
    mockFindByEmail.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "user-1", email: "test@example.com", name: "Test" });

    const { SignupWithPassword } = await import("@/useCases/users/SignupWithPassword");
    const useCase = new SignupWithPassword(fakeUserRepo);
    const result = await useCase.execute({
      name: "Test User",
      email: "test@example.com",
      password: "securePassword123",
    });

    expect(result.userId).toBe("user-1");
    expect(result.verificationTokenRaw).toBeDefined();
    expect(result.verificationTokenRaw).toHaveLength(64);

    // Verify password was hashed (not stored plain)
    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall.passwordHash).toBeDefined();
    expect(createCall.passwordHash).not.toBe("securePassword123");
    expect(createCall.passwordHash).toMatch(/^\$argon2/);
  });

  it("throws EMAIL_ALREADY_EXISTS when email is taken", async () => {
    mockFindByEmail.mockResolvedValue({ id: "existing", email: "taken@example.com" });

    const { SignupWithPassword } = await import("@/useCases/users/SignupWithPassword");
    const useCase = new SignupWithPassword(fakeUserRepo);

    await expect(
      useCase.execute({ name: "Test", email: "taken@example.com", password: "password123" }),
    ).rejects.toThrow("EMAIL_ALREADY_EXISTS");

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects passwords shorter than minimum length", async () => {
    const { SignupWithPassword } = await import("@/useCases/users/SignupWithPassword");
    const useCase = new SignupWithPassword(fakeUserRepo);

    await expect(useCase.execute({ name: "Test", email: "t@e.com", password: "short" })).rejects.toThrow();
  });
});
