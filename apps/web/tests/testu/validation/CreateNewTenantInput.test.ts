import { CreateNewTenantInput } from "@/useCases/tenant/CreateNewTenant";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("CreateNewTenantInput schema", () => {
  const valid = {
    name: "Test Tenant",
    subdomain: "test-tenant",
    ownerEmails: ["owner@example.com"],
  };

  it("accepts valid data", () => {
    expectZodSuccess(CreateNewTenantInput, valid);
  });

  it("accepts multiple owner emails", () => {
    const data = expectZodSuccess(CreateNewTenantInput, {
      ...valid,
      ownerEmails: ["a@b.com", "c@d.com"],
    });
    expect(data.ownerEmails).toHaveLength(2);
  });

  it("accepts empty ownerEmails array", () => {
    expectZodSuccess(CreateNewTenantInput, { ...valid, ownerEmails: [] });
  });

  it("does not include creatorId in schema (server-derived)", () => {
    const result = CreateNewTenantInput.safeParse({ ...valid, creatorId: "user-uuid" });
    expect(result.success).toBe(true);
    // creatorId should be stripped by Zod (not in schema)
    if (result.success) {
      expect(result.data).not.toHaveProperty("creatorId");
    }
  });

  it("rejects empty name", () => {
    expectZodFailure(CreateNewTenantInput, { ...valid, name: "" });
  });

  it("rejects empty subdomain", () => {
    expectZodFailure(CreateNewTenantInput, { ...valid, subdomain: "" });
  });

  it("rejects subdomain with uppercase letters", () => {
    expectZodFailure(CreateNewTenantInput, { ...valid, subdomain: "TestTenant" });
  });

  it("rejects subdomain with spaces", () => {
    expectZodFailure(CreateNewTenantInput, { ...valid, subdomain: "test tenant" });
  });

  it("rejects subdomain with special characters", () => {
    expectZodFailure(CreateNewTenantInput, { ...valid, subdomain: "test_tenant!" });
  });

  it("accepts subdomain with hyphens and numbers", () => {
    expectZodSuccess(CreateNewTenantInput, { ...valid, subdomain: "my-tenant-123" });
  });

  it("rejects invalid email in ownerEmails", () => {
    expectZodFailure(CreateNewTenantInput, { ...valid, ownerEmails: ["not-an-email"] });
  });

  it("rejects missing ownerEmails", () => {
    const { ownerEmails: _, ...data } = valid;
    expectZodFailure(CreateNewTenantInput, data);
  });
});
