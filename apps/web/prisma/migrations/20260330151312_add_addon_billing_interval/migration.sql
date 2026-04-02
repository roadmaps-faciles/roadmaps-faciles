-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "OrgAddon" ADD COLUMN     "billingInterval" "BillingInterval",
ADD COLUMN     "purchaseId" TEXT;
