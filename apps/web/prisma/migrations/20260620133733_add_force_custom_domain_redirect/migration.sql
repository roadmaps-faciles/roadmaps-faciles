-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'TENANT_FORCE_CUSTOM_DOMAIN_REDIRECT_UPDATE';

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "forceCustomDomainRedirect" BOOLEAN NOT NULL DEFAULT false;
