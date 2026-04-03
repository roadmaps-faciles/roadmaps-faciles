-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ROOT_LICENSE_REFRESH';

-- DropIndex
DROP INDEX "OrgAddon_org_addon_unique";

-- DropIndex
DROP INDEX "OrgAddon_org_tenant_addon_unique";

-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "instanceId" TEXT;
