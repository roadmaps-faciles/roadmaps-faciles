-- CreateEnum
CREATE TYPE "PostStatusColor" AS ENUM ('grey', 'gray', 'blueFrance', 'redMarianne', 'greenTilleulVerveine', 'greenBourgeon', 'greenEmeraude', 'greenMenthe', 'greenArchipel', 'blueEcume', 'blueCumulus', 'purpleGlycine', 'pinkMacaron', 'pinkTuile', 'yellowTournesol', 'yellowMoutarde', 'orangeTerreBattue', 'brownCafeCreme', 'brownCaramel', 'brownOpera', 'beigeGrisGalet', 'info', 'success', 'warning', 'error');

-- CreateEnum
CREATE TYPE "PostApprovalStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('fr', 'en');

-- CreateEnum
CREATE TYPE "EmailRegistrationPolicy" AS ENUM ('ANYONE', 'NOONE', 'DOMAINS');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'OWNER', 'INHERITED');

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "commonTokenPrefix" TEXT NOT NULL,
    "randomTokenPrefix" TEXT NOT NULL,
    "tokenDigest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "slug" TEXT,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "body" TEXT,
    "userId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "isPostUpdate" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "tokenDigest" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "anonymousId" TEXT,
    "postId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" "PostStatusColor" NOT NULL,
    "order" INTEGER NOT NULL,
    "showInRoadmap" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "boardId" INTEGER NOT NULL,
    "postStatusId" INTEGER,
    "tenantId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvalStatus" "PostApprovalStatus" NOT NULL DEFAULT 'APPROVED',

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pin" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "Pin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostStatusChange" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "postStatusId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "PostStatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "customDomain" TEXT,
    "subdomain" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'fr',

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSetting" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "allowVoting" BOOLEAN NOT NULL DEFAULT true,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "allowAnonymousVoting" BOOLEAN NOT NULL DEFAULT true,
    "allowPostEdits" BOOLEAN NOT NULL DEFAULT false,
    "showRoadmapInHeader" BOOLEAN NOT NULL DEFAULT false,
    "collapsedBoards" BOOLEAN NOT NULL DEFAULT false,
    "allowAnonymousFeedback" BOOLEAN NOT NULL DEFAULT true,
    "showVoteCount" BOOLEAN NOT NULL DEFAULT true,
    "showVoteButton" BOOLEAN NOT NULL DEFAULT true,
    "emailRegistrationPolicy" "EmailRegistrationPolicy" NOT NULL DEFAULT 'ANYONE',
    "allowedEmailDomains" TEXT[],
    "logoUrl" TEXT,
    "logoWidth" INTEGER NOT NULL DEFAULT 0,
    "logoHeight" INTEGER NOT NULL DEFAULT 0,
    "logoLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customCSS" TEXT,
    "useBrowserLocale" BOOLEAN NOT NULL DEFAULT false,
    "rootBoardId" INTEGER,

    CONSTRAINT "TenantSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantDefaultOAuth" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantDefaultOAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "username" TEXT,
    "image" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "signInCount" INTEGER NOT NULL DEFAULT 0,
    "currentSignInAt" TIMESTAMP(3),
    "lastSignInAt" TIMESTAMP(3),
    "currentSignInIp" TEXT,
    "lastSignInIp" TEXT,
    "recapNotificationFrequency" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnTenant" (
    "userId" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserOnTenant_pkey" PRIMARY KEY ("userId","tenantId")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "OAuth" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiKey_tenantId_idx" ON "ApiKey"("tenantId");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userId_tenantId_key" ON "ApiKey"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_tokenDigest_key" ON "ApiKey"("tokenDigest");

-- CreateIndex
CREATE INDEX "Board_tenantId_idx" ON "Board"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Board_name_tenantId_key" ON "Board"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Board_slug_tenantId_key" ON "Board"("slug", "tenantId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_tenantId_idx" ON "Comment"("tenantId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Follow_userId_idx" ON "Follow"("userId");

-- CreateIndex
CREATE INDEX "Follow_postId_idx" ON "Follow"("postId");

-- CreateIndex
CREATE INDEX "Follow_tenantId_idx" ON "Follow"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_postId_key" ON "Follow"("userId", "postId");

-- CreateIndex
CREATE INDEX "Invitation_tenantId_idx" ON "Invitation"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_email_tenantId_key" ON "Invitation"("email", "tenantId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE INDEX "Like_postId_idx" ON "Like"("postId");

-- CreateIndex
CREATE INDEX "Like_tenantId_idx" ON "Like"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_anonymousId_postId_key" ON "Like"("anonymousId", "postId");

-- CreateIndex
CREATE INDEX "PostStatus_tenantId_idx" ON "PostStatus"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PostStatus_name_tenantId_key" ON "PostStatus"("name", "tenantId");

-- CreateIndex
CREATE INDEX "Post_boardId_idx" ON "Post"("boardId");

-- CreateIndex
CREATE INDEX "Post_postStatusId_idx" ON "Post"("postStatusId");

-- CreateIndex
CREATE INDEX "Post_tenantId_idx" ON "Post"("tenantId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_tenantId_key" ON "Post"("slug", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Pin_postId_key" ON "Pin"("postId");

-- CreateIndex
CREATE INDEX "PostStatusChange_postId_idx" ON "PostStatusChange"("postId");

-- CreateIndex
CREATE INDEX "PostStatusChange_postStatusId_idx" ON "PostStatusChange"("postStatusId");

-- CreateIndex
CREATE INDEX "PostStatusChange_tenantId_idx" ON "PostStatusChange"("tenantId");

-- CreateIndex
CREATE INDEX "PostStatusChange_userId_idx" ON "PostStatusChange"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "Tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSetting_tenantId_key" ON "TenantSetting"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSetting_rootBoardId_key" ON "TenantSetting"("rootBoardId");

-- CreateIndex
CREATE INDEX "TenantSetting_tenantId_idx" ON "TenantSetting"("tenantId");

-- CreateIndex
CREATE INDEX "TenantSetting_rootBoardId_idx" ON "TenantSetting"("rootBoardId");

-- CreateIndex
CREATE INDEX "TenantDefaultOAuth_tenantId_idx" ON "TenantDefaultOAuth"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantDefaultOAuth_tenantId_provider_key" ON "TenantDefaultOAuth"("tenantId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "UserOnTenant_tenantId_idx" ON "UserOnTenant"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- CreateIndex
CREATE INDEX "OAuth_userId_idx" ON "OAuth"("userId");

-- CreateIndex
CREATE INDEX "OAuth_tenantId_idx" ON "OAuth"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuth_provider_uid_tenantId_key" ON "OAuth"("provider", "uid", "tenantId");

-- CreateIndex
CREATE INDEX "Webhook_tenantId_idx" ON "Webhook"("tenantId");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostStatus" ADD CONSTRAINT "PostStatus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_postStatusId_fkey" FOREIGN KEY ("postStatusId") REFERENCES "PostStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostStatusChange" ADD CONSTRAINT "PostStatusChange_postStatusId_fkey" FOREIGN KEY ("postStatusId") REFERENCES "PostStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSetting" ADD CONSTRAINT "TenantSetting_rootBoardId_fkey" FOREIGN KEY ("rootBoardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSetting" ADD CONSTRAINT "TenantSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnTenant" ADD CONSTRAINT "UserOnTenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnTenant" ADD CONSTRAINT "UserOnTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
