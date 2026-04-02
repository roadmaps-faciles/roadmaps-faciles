-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('NOTION');

-- CreateEnum
CREATE TYPE "IntegrationSyncStatus" AS ENUM ('SYNCED', 'PENDING', 'ERROR', 'CONFLICT');

-- CreateEnum
CREATE TYPE "SyncDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "SyncLogStatus" AS ENUM ('SUCCESS', 'ERROR', 'SKIPPED', 'CONFLICT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'INTEGRATION_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'INTEGRATION_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'INTEGRATION_DELETE';
ALTER TYPE "AuditAction" ADD VALUE 'INTEGRATION_SYNC';

-- CreateTable
CREATE TABLE "TenantIntegration" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "syncIntervalMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationMapping" (
    "id" SERIAL NOT NULL,
    "integrationId" INTEGER NOT NULL,
    "localType" TEXT NOT NULL,
    "localId" INTEGER NOT NULL,
    "remoteId" TEXT NOT NULL,
    "remoteUrl" TEXT,
    "syncStatus" "IntegrationSyncStatus" NOT NULL DEFAULT 'PENDING',
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncLog" (
    "id" SERIAL NOT NULL,
    "integrationId" INTEGER NOT NULL,
    "mappingId" INTEGER,
    "direction" "SyncDirection" NOT NULL,
    "status" "SyncLogStatus" NOT NULL,
    "message" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantIntegration_tenantId_idx" ON "TenantIntegration"("tenantId");

-- CreateIndex
CREATE INDEX "TenantIntegration_enabled_lastSyncAt_idx" ON "TenantIntegration"("enabled", "lastSyncAt");

-- CreateIndex
CREATE INDEX "IntegrationMapping_integrationId_idx" ON "IntegrationMapping"("integrationId");

-- CreateIndex
CREATE INDEX "IntegrationMapping_localType_localId_idx" ON "IntegrationMapping"("localType", "localId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationMapping_integrationId_localType_localId_key" ON "IntegrationMapping"("integrationId", "localType", "localId");

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_integrationId_createdAt_idx" ON "IntegrationSyncLog"("integrationId", "createdAt");

-- CreateIndex
CREATE INDEX "IntegrationSyncLog_mappingId_idx" ON "IntegrationSyncLog"("mappingId");

-- AddForeignKey
ALTER TABLE "TenantIntegration" ADD CONSTRAINT "TenantIntegration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationMapping" ADD CONSTRAINT "IntegrationMapping_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "TenantIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "TenantIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncLog" ADD CONSTRAINT "IntegrationSyncLog_mappingId_fkey" FOREIGN KEY ("mappingId") REFERENCES "IntegrationMapping"("id") ON DELETE SET NULL ON UPDATE CASCADE;
