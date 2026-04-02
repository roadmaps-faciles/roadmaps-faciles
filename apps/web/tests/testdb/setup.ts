import { prisma } from "@/lib/db/prisma";

async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;

  const tables = tablenames
    .filter(({ tablename }) => tablename !== "_prisma_migrations")
    .map(({ tablename }) => `"${tablename}"`)
    .join(", ");

  if (tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE`);
  }
}

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
});
