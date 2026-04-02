import { SendInvitationInput } from "@/useCases/invitations/SendInvitation";

import { expectZodFailure, expectZodSuccess } from "./_helpers";

describe("SendInvitationInput schema", () => {
  const valid = {
    tenantId: 1,
    email: "user@example.com",
    tenantUrl: "https://tenant.example.com",
  };

  it("accepts valid data", () => {
    expectZodSuccess(SendInvitationInput, valid);
  });

  it("defaults role to USER when not provided", () => {
    const data = expectZodSuccess(SendInvitationInput, valid);
    expect(data.role).toBe("USER");
  });

  it("accepts explicit role", () => {
    const data = expectZodSuccess(SendInvitationInput, { ...valid, role: "ADMIN" });
    expect(data.role).toBe("ADMIN");
  });

  it("accepts OWNER role", () => {
    const data = expectZodSuccess(SendInvitationInput, { ...valid, role: "OWNER" });
    expect(data.role).toBe("OWNER");
  });

  it("accepts MODERATOR role", () => {
    const data = expectZodSuccess(SendInvitationInput, { ...valid, role: "MODERATOR" });
    expect(data.role).toBe("MODERATOR");
  });

  it("rejects invalid role", () => {
    expectZodFailure(SendInvitationInput, { ...valid, role: "SUPERADMIN" });
  });

  it("rejects invalid email", () => {
    expectZodFailure(SendInvitationInput, { ...valid, email: "not-an-email" });
  });

  it("rejects invalid URL", () => {
    expectZodFailure(SendInvitationInput, { ...valid, tenantUrl: "not-a-url" });
  });

  it("rejects missing tenantId", () => {
    const { tenantId: _, ...data } = valid;
    expectZodFailure(SendInvitationInput, data);
  });

  it("rejects missing email", () => {
    const { email: _, ...data } = valid;
    expectZodFailure(SendInvitationInput, data);
  });

  it("rejects missing tenantUrl", () => {
    const { tenantUrl: _, ...data } = valid;
    expectZodFailure(SendInvitationInput, data);
  });
});
