-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('BOARD_CREATE', 'BOARD_DELETE', 'BOARD_REORDER', 'BOARD_UPDATE', 'POST_STATUS_CREATE', 'POST_STATUS_DELETE', 'POST_STATUS_REORDER', 'POST_STATUS_UPDATE', 'API_KEY_CREATE', 'API_KEY_DELETE', 'WEBHOOK_CREATE', 'WEBHOOK_DELETE', 'MEMBER_REMOVE', 'MEMBER_ROLE_UPDATE', 'MEMBER_STATUS_UPDATE', 'INVITATION_REVOKE', 'INVITATION_SEND', 'AUTHENTICATION_SETTINGS_UPDATE', 'ROADMAP_SETTINGS_UPDATE', 'TENANT_DELETE', 'TENANT_DOMAIN_UPDATE', 'TENANT_PURGE_DATA', 'TENANT_SEED_DATA', 'TENANT_SETTINGS_UPDATE', 'ROOT_MEMBER_REMOVE', 'ROOT_MEMBER_ROLE_UPDATE', 'ROOT_MEMBER_STATUS_UPDATE', 'ROOT_TENANT_CREATE', 'ROOT_USER_ROLE_UPDATE', 'ROOT_USER_STATUS_UPDATE', 'ROOT_USER_UPDATE');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" "AuditAction" NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "userId" TEXT,
    "tenantId" INTEGER,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
