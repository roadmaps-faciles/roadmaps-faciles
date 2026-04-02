-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ROOT_APP_SETTINGS_UPDATE';

-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN "pinnedTenantId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_pinnedTenantId_key" ON "AppSettings"("pinnedTenantId");

-- AddForeignKey
ALTER TABLE "AppSettings" ADD CONSTRAINT "AppSettings_pinnedTenantId_fkey" FOREIGN KEY ("pinnedTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
