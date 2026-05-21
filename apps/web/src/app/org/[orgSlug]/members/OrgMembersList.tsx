"use client";

import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@roadmaps-faciles/ui/components/select";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { type OrgMemberWithUser } from "@/lib/repo/IOrgMemberRepo";

import { inviteOrgMember, removeOrgMember, updateOrgMemberRole } from "./actions";

const ROLE_BADGE_VARIANT = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
} as const;

interface OrgMembersListProps {
  isOwner: boolean;
  members: OrgMemberWithUser[];
  orgId: number;
}

export const OrgMembersList = ({ members, orgId, isOwner }: OrgMembersListProps) => {
  const t = useTranslations("orgAdmin.members");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState<null | string>(null);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleInvite = () => {
    setError(null);
    startTransition(async () => {
      const result = await inviteOrgMember({ organizationId: orgId, email: inviteEmail, role: inviteRole });
      if (result.ok) {
        showSuccess(t("invited"));
        setInviteEmail("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleRoleChange = (memberId: number, role: string) => {
    setError(null);
    startTransition(async () => {
      const result = await updateOrgMemberRole({ memberId, organizationId: orgId, role });
      if (result.ok) {
        showSuccess(t("roleUpdated"));
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleRemove = (memberId: number, name: string) => {
    if (!confirm(t("removeConfirm", { name }))) return;
    setError(null);
    startTransition(async () => {
      const result = await removeOrgMember({ memberId, organizationId: orgId });
      if (result.ok) {
        showSuccess(t("removed"));
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertTitle>{success}</AlertTitle>
        </Alert>
      )}

      {/* Invite form */}
      {isOwner && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium">{t("invite")}</h3>
          <p className="text-sm text-muted-foreground">{t("inviteDescription")}</p>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="invite-email">{t("inviteEmail")}</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="w-40 space-y-1">
              <Label>{t("inviteRole")}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                  <SelectItem value="MEMBER">{t("roleMember")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={isPending || !inviteEmail}>
              {t("inviteSubmit")}
            </Button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <p className="font-medium">{member.user.name ?? member.user.email ?? member.user.username}</p>
              <p className="text-sm text-muted-foreground">{member.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {isOwner ? (
                <Select
                  value={member.role}
                  onValueChange={role => handleRoleChange(member.id, role)}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWNER">{t("roleOwner")}</SelectItem>
                    <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                    <SelectItem value="MEMBER">{t("roleMember")}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={ROLE_BADGE_VARIANT[member.role] ?? "outline"}>
                  {t(`role${member.role.charAt(0)}${member.role.slice(1).toLowerCase()}` as "roleOwner")}
                </Badge>
              )}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(member.id, member.user.name ?? member.user.email ?? String(member.id))}
                  disabled={isPending}
                >
                  {t("remove")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
