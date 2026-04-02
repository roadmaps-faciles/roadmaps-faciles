-- DropForeignKey (all relations being updated)
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_tenantId_fkey";
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";
ALTER TABLE "Board" DROP CONSTRAINT "Board_tenantId_fkey";
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_userId_fkey";
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";
ALTER TABLE "OrgAddon" DROP CONSTRAINT "OrgAddon_organizationId_fkey";
ALTER TABLE "OrgAddon" DROP CONSTRAINT "OrgAddon_tenantId_fkey";
ALTER TABLE "OrgDomain" DROP CONSTRAINT "OrgDomain_organizationId_fkey";
ALTER TABLE "OrgMember" DROP CONSTRAINT "OrgMember_organizationId_fkey";
ALTER TABLE "OrgMember" DROP CONSTRAINT "OrgMember_userId_fkey";
ALTER TABLE "Pin" DROP CONSTRAINT "Pin_boardId_fkey";
ALTER TABLE "Post" DROP CONSTRAINT "Post_boardId_fkey";
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";
ALTER TABLE "Post" DROP CONSTRAINT "Post_editedById_fkey";
ALTER TABLE "Post" DROP CONSTRAINT "Post_postStatusId_fkey";
ALTER TABLE "PostStatus" DROP CONSTRAINT "PostStatus_tenantId_fkey";
ALTER TABLE "PostStatusChange" DROP CONSTRAINT "PostStatusChange_postStatusId_fkey";
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_organizationId_fkey";
ALTER TABLE "TenantIntegration" DROP CONSTRAINT "TenantIntegration_tenantId_fkey";
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_tenantId_fkey";
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_rootBoardId_fkey";
ALTER TABLE "UserOnTenant" DROP CONSTRAINT "UserOnTenant_tenantId_fkey";
ALTER TABLE "UserOnTenant" DROP CONSTRAINT "UserOnTenant_userId_fkey";

-- AddForeignKey with CASCADE
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Board" ADD CONSTRAINT "Board_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostStatus" ADD CONSTRAINT "PostStatus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserOnTenant" ADD CONSTRAINT "UserOnTenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserOnTenant" ADD CONSTRAINT "UserOnTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantIntegration" ADD CONSTRAINT "TenantIntegration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrgDomain" ADD CONSTRAINT "OrgDomain_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrgAddon" ADD CONSTRAINT "OrgAddon_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey with SET NULL (nullable FKs)
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_postStatusId_fkey" FOREIGN KEY ("postStatusId") REFERENCES "PostStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PostStatusChange" ADD CONSTRAINT "PostStatusChange_postStatusId_fkey" FOREIGN KEY ("postStatusId") REFERENCES "PostStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_rootBoardId_fkey" FOREIGN KEY ("rootBoardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrgAddon" ADD CONSTRAINT "OrgAddon_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
