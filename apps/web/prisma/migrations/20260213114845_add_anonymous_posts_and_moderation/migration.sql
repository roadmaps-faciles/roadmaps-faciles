-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'POST_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'POST_APPROVE';
ALTER TYPE "AuditAction" ADD VALUE 'POST_REJECT';

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "anonymousId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "requirePostApproval" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Post_anonymousId_idx" ON "Post"("anonymousId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
