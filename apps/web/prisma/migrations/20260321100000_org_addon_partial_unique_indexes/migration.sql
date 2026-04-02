-- DropIndex: the Prisma-generated unique constraint treats NULL tenantId as distinct,
-- allowing duplicates for org-level addons. Replace with two partial unique indexes.
DROP INDEX IF EXISTS "OrgAddon_organizationId_tenantId_addon_key";

-- Org-level addons (tenantId IS NULL): one addon per org
CREATE UNIQUE INDEX "OrgAddon_org_addon_unique" ON "OrgAddon" ("organizationId", "addon") WHERE "tenantId" IS NULL;

-- Tenant-level addons (tenantId IS NOT NULL): one addon per org+tenant
CREATE UNIQUE INDEX "OrgAddon_org_tenant_addon_unique" ON "OrgAddon" ("organizationId", "tenantId", "addon") WHERE "tenantId" IS NOT NULL;
