-- Addon-first billing model (ADR 0027-1)
-- 1. Rename FREE → BASE in OrgPlan enum
-- 2. Remove ORGANIZATION from OrgPlan enum
-- 3. Add MULTI_TENANT to AddonType enum

-- Step 1: Rename FREE → BASE
ALTER TYPE "OrgPlan" RENAME VALUE 'FREE' TO 'BASE';

-- Step 2: Remove ORGANIZATION
-- PostgreSQL doesn't support DROP VALUE from enums directly.
-- We need to: create new type, migrate data, swap types.
-- But since we already renamed FREE→BASE, we just need to remove ORGANIZATION.
-- First, update any rows still using ORGANIZATION to BASE.
UPDATE "Organization" SET "plan" = 'BASE' WHERE "plan" = 'ORGANIZATION';

-- Create replacement enum without ORGANIZATION
CREATE TYPE "OrgPlan_new" AS ENUM ('BASE', 'GRANTED_FREE', 'GOV');

-- Alter column to use new enum
ALTER TABLE "Organization"
  ALTER COLUMN "plan" DROP DEFAULT,
  ALTER COLUMN "plan" TYPE "OrgPlan_new" USING ("plan"::text::"OrgPlan_new"),
  ALTER COLUMN "plan" SET DEFAULT 'BASE';

-- Drop old enum and rename new one
DROP TYPE "OrgPlan";
ALTER TYPE "OrgPlan_new" RENAME TO "OrgPlan";

-- Step 3: Add MULTI_TENANT to AddonType
ALTER TYPE "AddonType" ADD VALUE 'MULTI_TENANT';
