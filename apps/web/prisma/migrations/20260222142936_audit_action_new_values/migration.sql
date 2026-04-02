-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'COMMENT_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'POST_VOTE';
ALTER TYPE "AuditAction" ADD VALUE 'POST_UNVOTE';
ALTER TYPE "AuditAction" ADD VALUE 'PROFILE_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'ACCOUNT_DELETE';
ALTER TYPE "AuditAction" ADD VALUE 'EM_LINK_REQUEST';
ALTER TYPE "AuditAction" ADD VALUE 'EM_LINK_CONFIRM';
ALTER TYPE "AuditAction" ADD VALUE 'TWO_FACTOR_EMAIL_TOGGLE';
ALTER TYPE "AuditAction" ADD VALUE 'TWO_FACTOR_OTP_SETUP';
ALTER TYPE "AuditAction" ADD VALUE 'TWO_FACTOR_OTP_REMOVE';
ALTER TYPE "AuditAction" ADD VALUE 'TWO_FACTOR_PASSKEY_REGISTER';
ALTER TYPE "AuditAction" ADD VALUE 'TWO_FACTOR_PASSKEY_REMOVE';
