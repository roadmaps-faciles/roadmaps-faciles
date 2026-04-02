-- AlterTable
ALTER TABLE "IntegrationSyncLog" ADD COLUMN "syncRunId" TEXT;

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_syncRunId_idx" ON "IntegrationSyncLog"("syncRunId");
