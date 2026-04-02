import { revalidateSessionUser } from "@/lib/next-auth/revalidateSessionUser";
import { type UserRole, type UserStatus } from "@/prisma/enums";

function fakeUser(overrides = {}) {
  return {
    uuid: "user-1",
    ...overrides,
  };
}

function fakeDbUser(overrides = {}) {
  return {
    email: "test@test.com",
    name: "Test User",
    role: "USER" as UserRole,
    status: "ACTIVE" as UserStatus,
    twoFactorEnabled: false,
    isBetaGouvMember: false,
    username: "testuser",
    ...overrides,
  };
}

describe("revalidateSessionUser", () => {
  it("returns updated fields for ACTIVE user", async () => {
    const user = fakeUser();
    const dbUser = fakeDbUser({ name: "Updated Name", email: "new@test.com" });
    const findById = vi.fn().mockResolvedValue(dbUser);

    const result = await revalidateSessionUser(user, findById, []);

    expect(findById).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({
      role: "USER",
      status: "ACTIVE",
      name: "Updated Name",
      email: "new@test.com",
      twoFactorEnabled: false,
      isBetaGouvMember: false,
      isSuperAdmin: false,
    });
  });

  it("returns null when user not found in DB", async () => {
    const user = fakeUser();
    const findById = vi.fn().mockResolvedValue(null);

    const result = await revalidateSessionUser(user, findById, []);

    expect(result).toBeNull();
  });

  it("returns null when user status is DELETED", async () => {
    const user = fakeUser();
    const findById = vi.fn().mockResolvedValue(fakeDbUser({ status: "DELETED" }));

    const result = await revalidateSessionUser(user, findById, []);

    expect(result).toBeNull();
  });

  it("returns null when user status is BLOCKED", async () => {
    const user = fakeUser();
    const findById = vi.fn().mockResolvedValue(fakeDbUser({ status: "BLOCKED" }));

    const result = await revalidateSessionUser(user, findById, []);

    expect(result).toBeNull();
  });

  it("returns undefined on DB error (fail-open)", async () => {
    const user = fakeUser();
    const findById = vi.fn().mockRejectedValue(new Error("DB connection failed"));

    const result = await revalidateSessionUser(user, findById, []);

    expect(result).toBeUndefined();
  });

  it("reflects role change from USER to ADMIN", async () => {
    const user = fakeUser();
    const findById = vi.fn().mockResolvedValue(fakeDbUser({ role: "ADMIN" }));

    const result = await revalidateSessionUser(user, findById, []);

    expect(result).toEqual(expect.objectContaining({ role: "ADMIN" }));
  });

  it("sets isSuperAdmin to true when username is in admin list", async () => {
    const user = fakeUser();
    const findById = vi.fn().mockResolvedValue(fakeDbUser({ username: "admin-user" }));

    const result = await revalidateSessionUser(user, findById, ["admin-user"]);

    expect(result).toEqual(expect.objectContaining({ isSuperAdmin: true }));
  });

  it("sets isSuperAdmin to false when username is not in admin list", async () => {
    const user = fakeUser();
    const findById = vi.fn().mockResolvedValue(fakeDbUser({ username: "regular-user" }));

    const result = await revalidateSessionUser(user, findById, ["someone-else"]);

    expect(result).toEqual(expect.objectContaining({ isSuperAdmin: false }));
  });
});
