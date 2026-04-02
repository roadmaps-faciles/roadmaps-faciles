"use client";

import { MembersList as SharedMembersList, type MembersListActions } from "@/components/admin/MembersList";
import { type UserOnTenantWithUser } from "@/lib/repo/IUserOnTenantRepo";

import { removeMember, updateMemberRole, updateMemberStatus } from "./actions";

interface TenantMembersListProps {
  currentUserId: string;
  members: UserOnTenantWithUser[];
  superAdminIds?: string[];
}

const actions: MembersListActions = {
  onUpdateRole: updateMemberRole,
  onUpdateStatus: updateMemberStatus,
  onRemove: removeMember,
};

export const MembersList = ({ members, currentUserId, superAdminIds }: TenantMembersListProps) => (
  <SharedMembersList currentUserId={currentUserId} members={members} superAdminIds={superAdminIds} {...actions} />
);
