-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "stripeSubscriptionId" TEXT;

-- DropColumn (implicit was removed in schema)
ALTER TABLE "Organization" DROP COLUMN IF EXISTS "implicit";
