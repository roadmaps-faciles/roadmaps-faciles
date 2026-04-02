-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ROOT_FEATURE_FLAGS_UPDATE';

-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "featureFlags" JSONB;
