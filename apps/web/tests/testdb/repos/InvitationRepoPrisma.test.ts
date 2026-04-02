import { InvitationRepoPrisma } from "@/lib/repo/impl/InvitationRepoPrisma";

import { createTestInvitation, createTestTenantWithSettings } from "../helpers";

const repo = new InvitationRepoPrisma();

describe("InvitationRepoPrisma", () => {
  describe("create", () => {
    it("creates an invitation with tokenDigest", async () => {
      const { tenant } = await createTestTenantWithSettings();

      const invitation = await repo.create({
        email: "invite@example.com",
        tokenDigest: "abc123digest",
        tenantId: tenant.id,
      });

      expect(invitation.id).toBeGreaterThan(0);
      expect(invitation.email).toBe("invite@example.com");
      expect(invitation.tokenDigest).toBe("abc123digest");
      expect(invitation.role).toBe("USER");
      expect(invitation.acceptedAt).toBeNull();
    });

    it("creates an invitation with custom role", async () => {
      const { tenant } = await createTestTenantWithSettings();

      const invitation = await repo.create({
        email: "admin@example.com",
        tokenDigest: "admin-digest",
        tenantId: tenant.id,
        role: "ADMIN",
      });

      expect(invitation.role).toBe("ADMIN");
    });
  });

  describe("findById", () => {
    it("returns invitation when found", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const invitation = await createTestInvitation(tenant.id);

      const found = await repo.findById(invitation.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(invitation.id);
    });

    it("returns null when not found", async () => {
      const found = await repo.findById(999999);

      expect(found).toBeNull();
    });
  });

  describe("findAllForTenant", () => {
    it("returns invitations ordered by createdAt DESC", async () => {
      const { tenant } = await createTestTenantWithSettings();

      const inv1 = await createTestInvitation(tenant.id, {
        email: "first@test.com",
        createdAt: new Date("2024-01-01"),
      });
      await createTestInvitation(tenant.id, { email: "second@test.com", createdAt: new Date("2024-01-02") });
      const inv3 = await createTestInvitation(tenant.id, {
        email: "third@test.com",
        createdAt: new Date("2024-01-03"),
      });

      const invitations = await repo.findAllForTenant(tenant.id);

      expect(invitations).toHaveLength(3);
      // Most recent first
      expect(invitations[0].id).toBe(inv3.id);
      expect(invitations[2].id).toBe(inv1.id);
    });

    it("only returns invitations for the specified tenant", async () => {
      const { tenant: t1 } = await createTestTenantWithSettings();
      const { tenant: t2 } = await createTestTenantWithSettings();
      await createTestInvitation(t1.id);
      await createTestInvitation(t1.id);
      await createTestInvitation(t2.id);

      const invitations = await repo.findAllForTenant(t1.id);

      expect(invitations).toHaveLength(2);
    });
  });

  describe("delete", () => {
    it("deletes an invitation", async () => {
      const { tenant } = await createTestTenantWithSettings();
      const invitation = await createTestInvitation(tenant.id);

      await repo.delete(invitation.id);

      const found = await repo.findById(invitation.id);
      expect(found).toBeNull();
    });
  });

  describe("uniqueness constraints", () => {
    it("prevents duplicate email per tenant", async () => {
      const { tenant } = await createTestTenantWithSettings();
      await createTestInvitation(tenant.id, { email: "unique@test.com" });

      await expect(createTestInvitation(tenant.id, { email: "unique@test.com" })).rejects.toThrow();
    });

    it("allows same email on different tenants", async () => {
      const { tenant: t1 } = await createTestTenantWithSettings();
      const { tenant: t2 } = await createTestTenantWithSettings();

      await createTestInvitation(t1.id, { email: "shared@test.com" });
      const inv2 = await createTestInvitation(t2.id, { email: "shared@test.com" });

      expect(inv2.email).toBe("shared@test.com");
    });
  });
});
