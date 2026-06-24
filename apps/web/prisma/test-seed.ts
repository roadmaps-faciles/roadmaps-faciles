/**
 * Seed de test enrichi - donnees previsibles pour les tests E2E.
 *
 * Usage: pnpm run-script prisma/test-seed.ts
 */
import { prisma } from "@/lib/db/prisma";
import { $Enums } from "@/prisma/client";

async function main() {
  console.log("Test seed en cours...");

  // ---------------------------------------------------------------------------
  // 1. Cleanup - FK-safe order (all models that reference Post, User, Tenant)
  // ---------------------------------------------------------------------------
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.pin.deleteMany();
  await prisma.postStatusChange.deleteMany();
  await prisma.post.deleteMany();
  await prisma.postStatus.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.oAuth.deleteMany();
  await prisma.authenticator.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userOnTenant.deleteMany();
  await prisma.board.deleteMany();
  await prisma.tenantDefaultOAuth.deleteMany();
  await prisma.tenantSettings.deleteMany();
  await prisma.orgAddon.deleteMany();
  await prisma.orgDomain.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleanup done.");

  // ---------------------------------------------------------------------------
  // 2. Tenant + Settings
  // ---------------------------------------------------------------------------
  const organization = await prisma.organization.create({
    data: {
      name: "E2E Test Org",
      slug: "e2e",
      plan: "BASE",
    },
  });

  console.log("Organization created:", organization.id);

  const tenant = await prisma.tenant.create({ data: { organizationId: organization.id } });

  await prisma.tenantSettings.create({
    data: {
      tenantId: tenant.id,
      name: "E2E Test Tenant",
      subdomain: "e2e",
      requirePostApproval: true,
      allowVoting: true,
      allowComments: true,
      allowAnonymousFeedback: true,
      allowAnonymousVoting: true,
      allowPostEdits: true,
      allowPostDeletion: true,
      allowEmbedding: true,
      uiTheme: $Enums.UiTheme.Dsfr,
    },
  });

  console.log("Tenant created:", tenant.id);

  // Tenant dedie au test de redirection canonique (#25) : subdomain "canon" avec customDomain
  // (non-plateforme) + flag actif. Isole pour ne pas faire rediriger le tenant "e2e" principal.
  const redirectTenant = await prisma.tenant.create({ data: { organizationId: organization.id } });
  await prisma.tenantSettings.create({
    data: {
      tenantId: redirectTenant.id,
      name: "Canonical Redirect Tenant",
      subdomain: "canon",
      customDomain: "canonical.example.com",
      forceCustomDomainRedirect: true,
    },
  });

  console.log("Redirect tenant created:", redirectTenant.id);

  // ---------------------------------------------------------------------------
  // 3. AppSettings singleton
  // ---------------------------------------------------------------------------
  await prisma.appSettings.upsert({
    where: { id: 0 },
    update: {},
    create: { id: 0 },
  });

  console.log("AppSettings upserted.");

  // ---------------------------------------------------------------------------
  // 4. Users
  // ---------------------------------------------------------------------------
  const admin = await prisma.user.create({
    data: {
      name: "Test Admin",
      email: "test-admin@test.local",
      emailVerified: new Date(),
      role: $Enums.UserRole.ADMIN,
      status: $Enums.UserStatus.ACTIVE,
      username: "test-admin",
    },
  });

  const mod = await prisma.user.create({
    data: {
      name: "Test Moderator",
      email: "test-mod@test.local",
      emailVerified: new Date(),
      role: $Enums.UserRole.USER,
      status: $Enums.UserStatus.ACTIVE,
      username: "test-mod",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test-user@test.local",
      emailVerified: new Date(),
      role: $Enums.UserRole.USER,
      status: $Enums.UserStatus.ACTIVE,
      username: "test-user",
    },
  });

  const otpUser = await prisma.user.create({
    data: {
      name: "Test OTP User",
      email: "test-otp@test.local",
      emailVerified: new Date(),
      role: $Enums.UserRole.USER,
      status: $Enums.UserStatus.ACTIVE,
      username: "test-otp",
      otpSecret: "JBSWY3DPEHPK3PXP",
      otpVerifiedAt: new Date(),
    },
  });

  console.log("Users created:", admin.email, mod.email, user.email, otpUser.email);

  // ---------------------------------------------------------------------------
  // 5. Memberships on tenant
  // ---------------------------------------------------------------------------
  await prisma.userOnTenant.createMany({
    data: [
      {
        userId: admin.id,
        tenantId: tenant.id,
        role: $Enums.UserRole.OWNER,
        status: $Enums.UserStatus.ACTIVE,
      },
      {
        userId: mod.id,
        tenantId: tenant.id,
        role: $Enums.UserRole.MODERATOR,
        status: $Enums.UserStatus.ACTIVE,
      },
      {
        userId: user.id,
        tenantId: tenant.id,
        role: $Enums.UserRole.USER,
        status: $Enums.UserStatus.ACTIVE,
      },
      {
        userId: otpUser.id,
        tenantId: tenant.id,
        role: $Enums.UserRole.USER,
        status: $Enums.UserStatus.ACTIVE,
      },
    ],
  });

  console.log("Memberships created.");

  // ---------------------------------------------------------------------------
  // 5b. Org memberships
  // ---------------------------------------------------------------------------
  await prisma.orgMember.create({
    data: {
      organizationId: organization.id,
      userId: admin.id,
      role: "OWNER",
    },
  });

  console.log("OrgMember OWNER created.");

  // ---------------------------------------------------------------------------
  // 6. Boards
  // ---------------------------------------------------------------------------
  const board1 = await prisma.board.create({
    data: {
      tenantId: tenant.id,
      name: "Test Board",
      order: 0,
      slug: "test-board",
    },
  });

  const board2 = await prisma.board.create({
    data: {
      tenantId: tenant.id,
      name: "Second Board",
      order: 1,
      slug: "second-board",
    },
  });

  console.log("Boards created:", board1.name, board2.name);

  // ---------------------------------------------------------------------------
  // 7. Post Statuses
  // ---------------------------------------------------------------------------
  const statusEnCours = await prisma.postStatus.create({
    data: {
      tenantId: tenant.id,
      name: "En cours",
      color: $Enums.PostStatusColor.blueFrance,
      order: 0,
      showInRoadmap: true,
    },
  });

  const statusTermine = await prisma.postStatus.create({
    data: {
      tenantId: tenant.id,
      name: "Terminé",
      color: $Enums.PostStatusColor.greenBourgeon,
      order: 1,
      showInRoadmap: true,
    },
  });

  console.log("PostStatuses created:", statusEnCours.name, statusTermine.name);

  // ---------------------------------------------------------------------------
  // 8. Posts (all on board1)
  // ---------------------------------------------------------------------------
  const testPost = await prisma.post.create({
    data: {
      tenantId: tenant.id,
      boardId: board1.id,
      title: "Test Post",
      description: "A test post for E2E tests",
      userId: admin.id,
      approvalStatus: $Enums.PostApprovalStatus.APPROVED,
      slug: "test-post",
      postStatusId: statusEnCours.id,
    },
  });

  const pendingPost = await prisma.post.create({
    data: {
      tenantId: tenant.id,
      boardId: board1.id,
      title: "Pending Post",
      description: "A pending post awaiting moderation",
      userId: user.id,
      approvalStatus: $Enums.PostApprovalStatus.PENDING,
      slug: "pending-post",
    },
  });

  const rejectedPost = await prisma.post.create({
    data: {
      tenantId: tenant.id,
      boardId: board1.id,
      title: "Rejected Post",
      description: "A rejected post",
      userId: user.id,
      approvalStatus: $Enums.PostApprovalStatus.REJECTED,
      slug: "rejected-post",
    },
  });

  const anonymousPost = await prisma.post.create({
    data: {
      tenantId: tenant.id,
      boardId: board1.id,
      title: "Anonymous Post",
      description: "An anonymous post for E2E tests",
      userId: null,
      anonymousId: "anon-e2e-test-id",
      approvalStatus: $Enums.PostApprovalStatus.APPROVED,
      slug: "anonymous-post",
    },
  });

  console.log(
    "Posts created:",
    testPost.title,
    pendingPost.title,
    rejectedPost.title,
    anonymousPost.title,
  );

  // ---------------------------------------------------------------------------
  // 9. Invitation
  // ---------------------------------------------------------------------------
  await prisma.invitation.create({
    data: {
      email: "invited@test.local",
      tokenDigest: "e2e-test-invitation-token-digest".padEnd(64, "0"),
      tenantId: tenant.id,
      role: $Enums.UserRole.USER,
    },
  });

  console.log("Invitation created.");

  // ---------------------------------------------------------------------------
  // 10. AuditLog entry
  // ---------------------------------------------------------------------------
  await prisma.auditLog.create({
    data: {
      action: $Enums.AuditAction.ROOT_TENANT_CREATE,
      userId: admin.id,
      tenantId: tenant.id,
      success: true,
    },
  });

  console.log("AuditLog entry created.");

  console.log("Test seed terminated successfully.");
}

main()
  .catch((e) => {
    console.error("Test seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
