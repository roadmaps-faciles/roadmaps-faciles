-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'POST_DELETE';
ALTER TYPE "AuditAction" ADD VALUE 'POST_EDIT';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "editedById" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
