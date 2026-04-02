-- CreateEnum
CREATE TYPE "OrgPlan" AS ENUM ('FREE', 'ORGANIZATION', 'GRANTED_FREE', 'GOV');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "AddonType" AS ENUM ('TRACKING', 'INTEGRATIONS', 'STORAGE_S3', 'DNS_MANAGEMENT', 'CUSTOM_DOMAIN', 'SSO_ENTERPRISE', 'TWO_FACTOR_ENTERPRISE', 'API_KEYS', 'WEBHOOKS', 'AUDIT_LOG', 'THEME_DSFR', 'CRON_JOBS');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ORG_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_DELETE';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_MEMBER_ADD';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_MEMBER_REMOVE';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_MEMBER_ROLE_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_DOMAIN_ADD';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_DOMAIN_REMOVE';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_DOMAIN_VERIFY';
ALTER TYPE "AuditAction" ADD VALUE 'ORG_ADDON_TOGGLE';

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "OrgPlan" NOT NULL DEFAULT 'FREE',
    "implicit" BOOLEAN NOT NULL DEFAULT true,
    "stripeCustomerId" TEXT,
    "payAsYouWantCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgMember" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgDomain" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "domain" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "isGouv" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgAddon" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "tenantId" INTEGER,
    "addon" "AddonType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgAddon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "OrgMember_organizationId_idx" ON "OrgMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrgMember_userId_idx" ON "OrgMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMember_organizationId_userId_key" ON "OrgMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgDomain_domain_key" ON "OrgDomain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "OrgDomain_verificationToken_key" ON "OrgDomain"("verificationToken");

-- CreateIndex
CREATE INDEX "OrgDomain_organizationId_idx" ON "OrgDomain"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgAddon_organizationId_tenantId_addon_key" ON "OrgAddon"("organizationId", "tenantId", "addon");

-- AlterTable — Step 1: add nullable column
ALTER TABLE "Tenant" ADD COLUMN "organizationId" INTEGER;

-- Backfill — Create implicit Organization for each existing Tenant
INSERT INTO "Organization" ("name", "slug", "plan", "implicit", "updatedAt")
SELECT
    COALESCE(ts."name", 'orphan-' || t."id"),
    COALESCE(ts."subdomain", 'orphan-' || t."id"),
    'FREE'::"OrgPlan",
    true,
    NOW()
FROM "Tenant" t
LEFT JOIN "TenantSettings" ts ON ts."tenantId" = t."id"
WHERE t."organizationId" IS NULL;

-- Backfill — Link Tenants to their Organizations
UPDATE "Tenant" t
SET "organizationId" = o."id"
FROM "Organization" o
JOIN "TenantSettings" ts ON ts."subdomain" = o."slug"
WHERE ts."tenantId" = t."id" AND t."organizationId" IS NULL;

-- Backfill fallback — orphan tenants (no TenantSettings)
UPDATE "Tenant" t
SET "organizationId" = o."id"
FROM "Organization" o
WHERE o."slug" = 'orphan-' || t."id" AND t."organizationId" IS NULL;

-- Backfill — Create OrgMember OWNER for first OWNER of each tenant
INSERT INTO "OrgMember" ("organizationId", "userId", "role", "updatedAt")
SELECT DISTINCT ON (t."organizationId")
    t."organizationId",
    uot."userId",
    'OWNER'::"OrgRole",
    NOW()
FROM "UserOnTenant" uot
JOIN "Tenant" t ON t."id" = uot."tenantId"
WHERE uot."role" = 'OWNER'
ORDER BY t."organizationId", uot."joinedAt" ASC;

-- AlterTable — Step 2: set NOT NULL
ALTER TABLE "Tenant" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Tenant_organizationId_idx" ON "Tenant"("organizationId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgDomain" ADD CONSTRAINT "OrgDomain_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAddon" ADD CONSTRAINT "OrgAddon_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAddon" ADD CONSTRAINT "OrgAddon_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
