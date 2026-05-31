import { createMinimalInstance } from "@/lib/bootstrap";
import { prisma } from "@/lib/db/prisma";

describe("createMinimalInstance", () => {
  it("bootstraps a minimal instance on an empty database", async () => {
    const result = await createMinimalInstance({
      adminEmail: "ops@example.gouv.fr",
      adminPassword: "s3cret-bootstrap",
      tenantName: "Mon Espace",
      tenantSubdomain: "espace",
    });

    expect(result.alreadyInitialized).toBe(false);
    expect(result.adminEmail).toBe("ops@example.gouv.fr");
    expect(result.tenantId).toBeTypeOf("number");

    expect(await prisma.organization.count()).toBe(1);
    expect(await prisma.tenant.count()).toBe(1);
    expect(await prisma.tenantSettings.count()).toBe(1);

    const admin = await prisma.user.findUniqueOrThrow({ where: { email: "ops@example.gouv.fr" } });
    expect(admin.passwordHash).toBeTruthy();
    expect(admin.role).toBe("ADMIN");
    expect(admin.emailVerified).not.toBeNull();

    const membership = await prisma.userOnTenant.findFirstOrThrow({ where: { userId: admin.id } });
    expect(membership.role).toBe("OWNER");

    const orgMember = await prisma.orgMember.findFirstOrThrow({ where: { userId: admin.id } });
    expect(orgMember.role).toBe("OWNER");

    expect(await prisma.board.count()).toBeGreaterThan(0);
    expect(await prisma.postStatus.count()).toBeGreaterThan(0);
  });

  it("does not set a password hash when none is provided", async () => {
    await createMinimalInstance({ adminEmail: "nopwd@example.gouv.fr" });

    const admin = await prisma.user.findUniqueOrThrow({ where: { email: "nopwd@example.gouv.fr" } });
    expect(admin.passwordHash).toBeNull();
  });

  it("is idempotent when a tenant already exists", async () => {
    await createMinimalInstance({ adminEmail: "first@example.gouv.fr" });
    const second = await createMinimalInstance({ adminEmail: "second@example.gouv.fr" });

    expect(second.alreadyInitialized).toBe(true);
    expect(await prisma.tenant.count()).toBe(1);
    expect(await prisma.user.count()).toBe(1);
  });
});
