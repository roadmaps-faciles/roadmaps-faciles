-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'SECURITY_SETTINGS_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'ROOT_SECURITY_SETTINGS_UPDATE';

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "force2FA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "force2FAGraceDays" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpSecret" TEXT,
ADD COLUMN     "otpVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "twoFactorDeadline" TIMESTAMP(3),
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL DEFAULT 0,
    "force2FA" BOOLEAN NOT NULL DEFAULT false,
    "force2FAGraceDays" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
