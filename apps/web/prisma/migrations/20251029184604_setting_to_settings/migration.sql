ALTER TABLE "TenantSetting"
    RENAME TO "TenantSettings";
-- AlterTable
ALTER TABLE "TenantSettings"
    RENAME CONSTRAINT "TenantSetting_pkey" TO "TenantSettings_pkey";
-- RenameForeignKey
ALTER TABLE "TenantSettings"
    RENAME CONSTRAINT "TenantSetting_rootBoardId_fkey" TO "TenantSettings_rootBoardId_fkey";
-- RenameForeignKey
ALTER TABLE "TenantSettings"
    RENAME CONSTRAINT "TenantSetting_tenantId_fkey" TO "TenantSettings_tenantId_fkey";
-- RenameIndex
ALTER INDEX "TenantSetting_customDomain_key"
RENAME TO "TenantSettings_customDomain_key";
-- RenameIndex
ALTER INDEX "TenantSetting_rootBoardId_idx"
RENAME TO "TenantSettings_rootBoardId_idx";
-- RenameIndex
ALTER INDEX "TenantSetting_rootBoardId_key"
RENAME TO "TenantSettings_rootBoardId_key";
-- RenameIndex
ALTER INDEX "TenantSetting_subdomain_key"
RENAME TO "TenantSettings_subdomain_key";
-- RenameIndex
ALTER INDEX "TenantSetting_tenantId_idx"
RENAME TO "TenantSettings_tenantId_idx";
-- RenameIndex
ALTER INDEX "TenantSetting_tenantId_key"
RENAME TO "TenantSettings_tenantId_key";