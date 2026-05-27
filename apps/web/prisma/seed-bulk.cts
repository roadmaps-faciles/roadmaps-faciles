import { fakerFR as faker } from "@faker-js/faker";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { $Enums, type Comment, type Like } from "@/prisma/client";

const ORG_TEMPLATES = [
  { name: "Acme Corp", slug: "acme", plan: "BASE" as const },
  { name: "Beta Gouv", slug: "beta-gouv", plan: "GOV" as const },
  { name: "Startup Nation", slug: "startup-nation", plan: "BASE" as const },
  { name: "Tech & Co", slug: "tech-co", plan: "GRANTED_FREE" as const },
  { name: "Services Publics+", slug: "services-publics", plan: "GOV" as const },
  { name: "Collectivité Numérique", slug: "collectivite-num", plan: "GOV" as const },
  { name: "EdTech Labs", slug: "edtech-labs", plan: "BASE" as const },
  { name: "Santé Connect", slug: "sante-connect", plan: "GRANTED_FREE" as const },
];

const TENANT_NAMES = [
  "Portail Citoyen",
  "Espace Collaborateur",
  "Plateforme RH",
  "Feedback Produit",
  "Forum Interne",
  "Support Client",
  "Hub Innovation",
  "Roadmap Publique",
  "Base de Connaissances",
  "Lab Expérimentation",
  "Canal Idées",
  "Tableau de Bord",
];

const BOARD_NAMES = [
  "Feature Requests",
  "Bug Reports",
  "Améliorations UX",
  "Infrastructure",
  "Documentation",
  "Mobile",
  "Accessibilité",
  "Performance",
];

const STATUS_SETS = [
  { name: "Planifié", color: "blueCumulus", roadmap: true },
  { name: "En cours", color: "purpleGlycine", roadmap: true },
  { name: "Complété", color: "greenMenthe", roadmap: true },
  { name: "Rejetté", color: "error", roadmap: false },
  { name: "En attente", color: "yellowMoutarde", roadmap: false },
  { name: "Bloqué", color: "redMarianne", roadmap: false },
] as const;

const BOARDS_PER_TENANT = { min: 2, max: 4 };
const MAX_LIKES_PER_POST = 30;
const MAX_COMMENTS_PER_POST = 5;

const USER_ROLES: Array<$Enums.UserRole> = ["OWNER", "ADMIN", "MODERATOR", "USER", "USER", "USER", "USER"];
const ORG_ROLES: Array<$Enums.OrgRole> = ["OWNER", "ADMIN", "MEMBER", "MEMBER", "MEMBER"];

async function createUser() {
  const sex = faker.person.sexType();
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName(sex);
  const createdAt = faker.date.past({ years: 2 });

  return prisma.user.create({
    data: {
      name: faker.person.fullName({ sex, firstName, lastName }),
      email: faker.internet
        .email({ provider: "faker.beta.gouv.fr", firstName, lastName })
        .toLowerCase(),
      emailVerified: faker.date.soon({ refDate: createdAt }),
      username: faker.internet.username({ firstName, lastName }),
      role: $Enums.UserRole.USER,
      status: $Enums.UserStatus.ACTIVE,
      createdAt,
    },
  });
}

async function createPostsForTenant(
  tenantId: number,
  boards: Array<{ id: number }>,
  statuses: Array<{ id: number }>,
  userIds: string[],
  postsRange: { max: number; min: number },
) {
  const postCount = faker.number.int(postsRange);
  console.log(`    📝 ${postCount} posts...`);

  for (let i = 0; i < postCount; i++) {
    const title = faker.lorem.sentence({ min: 3, max: 8 });
    const createdAt = faker.date.past({ years: 1 });
    const board = faker.helpers.arrayElement(boards);
    const status = faker.helpers.arrayElement(statuses);
    const userId = faker.helpers.arrayElement(userIds);

    const post = await prisma.post.create({
      data: {
        title,
        slug: faker.helpers.slugify(title).toLowerCase().slice(0, 80),
        description: faker.lorem.paragraphs({ min: 1, max: 3 }),
        boardId: board.id,
        postStatusId: status.id,
        userId,
        tenantId,
        tags: [...new Set(Array.from({ length: faker.number.int(3) }, () => faker.git.branch()))],
        createdAt,
        updatedAt: faker.date.soon({ refDate: createdAt }),
      },
    });

    await prisma.like.createMany({
      data: Array.from({ length: faker.number.int(MAX_LIKES_PER_POST) }, () => ({
        postId: post.id,
        anonymousId: faker.string.uuid(),
        tenantId,
      })) as Like[],
    });

    const commentCount = faker.number.int(MAX_COMMENTS_PER_POST);
    if (commentCount > 0) {
      await prisma.comment.createMany({
        data: Array.from({ length: commentCount }, () => ({
          body: faker.lorem.paragraph({ min: 1, max: 3 }),
          postId: post.id,
          userId: faker.helpers.arrayElement(userIds),
          tenantId,
          createdAt: faker.date.soon({ refDate: createdAt }),
        })) as Comment[],
      });
    }
  }
}

export async function runBulkSeed() {
  const bulkOrgs = config.seed.bulkOrgs;
  const bulkTenantsPerOrg = config.seed.bulkTenantsPerOrg;
  const bulkSharedUsers = config.seed.bulkSharedUsers;
  const postsRange = { min: config.seed.bulkMinPostsPerTenant, max: config.seed.bulkMaxPostsPerTenant };

  const orgs = ORG_TEMPLATES.slice(0, bulkOrgs);

  const sharedUserPool = await Promise.all(
    Array.from({ length: bulkSharedUsers }, () => createUser()),
  );
  console.log(`👤 ${sharedUserPool.length} utilisateurs créés (pool partagé)\n`);

  let tenantIndex = 0;

  for (const orgDef of orgs) {
    const org = await prisma.organization.create({
      data: { name: orgDef.name, slug: orgDef.slug, plan: orgDef.plan },
    });
    console.log(`🏢 Org "${org.name}" (${org.slug}, plan=${orgDef.plan})`);

    const orgUsers = faker.helpers.arrayElements(sharedUserPool, { min: 4, max: 10 });

    for (let u = 0; u < orgUsers.length; u++) {
      const role = ORG_ROLES[Math.min(u, ORG_ROLES.length - 1)];
      await prisma.orgMember.create({
        data: { organizationId: org.id, userId: orgUsers[u].id, role },
      });
    }
    console.log(`  👥 ${orgUsers.length} membres org`);

    const tenantCount = Math.min(bulkTenantsPerOrg, TENANT_NAMES.length);
    for (let t = 0; t < tenantCount; t++) {
      const tenantName = TENANT_NAMES[tenantIndex % TENANT_NAMES.length];
      const subdomain = faker.helpers.slugify(tenantName).toLowerCase();
      tenantIndex++;

      const tenant = await prisma.tenant.create({
        data: { organizationId: org.id },
      });

      await prisma.tenantSettings.create({
        data: {
          tenantId: tenant.id,
          name: tenantName,
          subdomain: `${subdomain}-${tenant.id}`,
          uiTheme: orgDef.plan === "GOV" ? "Dsfr" : "Default",
        },
      });

      const tenantUsers = faker.helpers.arrayElements(orgUsers, { min: 3, max: orgUsers.length });
      const tenantUserIds: string[] = [];

      for (let u = 0; u < tenantUsers.length; u++) {
        const role = USER_ROLES[Math.min(u, USER_ROLES.length - 1)];
        await prisma.userOnTenant.create({
          data: {
            userId: tenantUsers[u].id,
            tenantId: tenant.id,
            role,
            status: $Enums.UserStatus.ACTIVE,
          },
        });
        tenantUserIds.push(tenantUsers[u].id);
      }

      const boardCount = faker.number.int(BOARDS_PER_TENANT);
      const boardNames = faker.helpers.arrayElements(BOARD_NAMES, boardCount);
      const boards = await Promise.all(
        boardNames.map((name, order) =>
          prisma.board.create({
            data: {
              name,
              slug: faker.helpers.slugify(name).toLowerCase(),
              description: faker.lorem.sentence(),
              order,
              tenantId: tenant.id,
            },
          }),
        ),
      );

      const statusColors = faker.helpers.arrayElements(STATUS_SETS, { min: 3, max: STATUS_SETS.length });
      const statuses = await Promise.all(
        statusColors.map((s, order) =>
          prisma.postStatus.create({
            data: {
              name: s.name,
              color: s.color,
              order,
              tenantId: tenant.id,
              showInRoadmap: s.roadmap,
            },
          }),
        ),
      );

      await prisma.tenantSettings.update({
        where: { tenantId: tenant.id },
        data: { rootBoardId: boards[0].id },
      });

      console.log(`  📦 Tenant "${tenantName}" - ${tenantUsers.length} users, ${boards.length} boards`);
      await createPostsForTenant(tenant.id, boards, statuses, tenantUserIds, postsRange);
    }

    console.log();
  }

  const counts = await Promise.all([
    prisma.organization.count(),
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
  ]);

  console.log("✅ Bulk seed terminé !");
  console.log(`   Orgs: ${counts[0]}, Tenants: ${counts[1]}, Users: ${counts[2]}`);
  console.log(`   Posts: ${counts[3]}, Comments: ${counts[4]}, Likes: ${counts[5]}`);
}
