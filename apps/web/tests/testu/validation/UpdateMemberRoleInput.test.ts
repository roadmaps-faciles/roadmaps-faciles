import { UpdateMemberRoleInput } from "@/useCases/user_on_tenant/UpdateMemberRole";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("UpdateMemberRoleInput schema", () => {
  const valid = { userId: "user-1", tenantId: 1, role: "ADMIN" };

  it("accepts valid data", () => {
    expectZodSuccess(UpdateMemberRoleInput, valid);
  });

  it("accepts all valid roles", () => {
    for (const role of ["USER", "MODERATOR", "ADMIN", "OWNER", "INHERITED"]) {
      expectZodSuccess(UpdateMemberRoleInput, { ...valid, role });
    }
  });

  it("rejects invalid role", () => {
    expectZodFailure(UpdateMemberRoleInput, { ...valid, role: "SUPERADMIN" });
  });

  it("rejects missing userId", () => {
    expectZodFailure(UpdateMemberRoleInput, { tenantId: 1, role: "ADMIN" });
  });

  it("rejects missing tenantId", () => {
    expectZodFailure(UpdateMemberRoleInput, { userId: "user-1", role: "ADMIN" });
  });

  it("rejects missing role", () => {
    expectZodFailure(UpdateMemberRoleInput, { userId: "user-1", tenantId: 1 });
  });
});
