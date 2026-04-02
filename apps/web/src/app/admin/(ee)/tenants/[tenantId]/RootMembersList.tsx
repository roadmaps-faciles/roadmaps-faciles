"use client";

import { MembersList } from "@/components/admin/MembersList";
import { type UserOnTenantWithUser } from "@/lib/repo/IUserOnTenantRepo";
import { type UserRole, type UserStatus } from "@/prisma/enums";
import { type ServerActionResponse } from "@/utils/next";

import { removeMember, updateMemberRole, updateMemberStatus } from "./actions";

interface RootMembersListProps {
  currentUserId: string;
  members: UserOnTenantWithUser[];
  superAdminIds?: string[];
  tenantId: number;
}

export const RootMembersList = ({ members, currentUserId, superAdminIds, tenantId }: RootMembersListProps) => {
  const handleUpdateRole = async (data: { role: UserRole; userId: string }): Promise<ServerActionResponse> => {
    return updateMemberRole({ ...data, tenantId });
  };

  const handleUpdateStatus = async (data: { status: UserStatus; userId: string }): Promise<ServerActionResponse> => {
    return updateMemberStatus({ ...data, tenantId });
  };

  const handleRemove = async (data: { userId: string }): Promise<ServerActionResponse> => {
    return removeMember({ ...data, tenantId });
  };

  return (
    <MembersList
      currentUserId={currentUserId}
      members={members}
      superAdminIds={superAdminIds}
      onUpdateRole={handleUpdateRole}
      onUpdateStatus={handleUpdateStatus}
      onRemove={handleRemove}
    />
  );
};
