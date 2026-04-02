-- CreateEnum
CREATE TYPE "UiTheme" AS ENUM ('Default', 'Dsfr');

-- AlterTable
ALTER TABLE "TenantSettings" ADD COLUMN     "uiTheme" "UiTheme" NOT NULL DEFAULT 'Default';
