"use client";

import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roadmaps-faciles/ui/components/table";
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { type Invitation } from "@/prisma/client";
import { UserRole } from "@/prisma/enums";
import { type InvitationRole } from "@/useCases/invitations/SendInvitation";

import { revokeInvitation, sendInvitation } from "./actions";

interface InvitationsListProps {
  invitations: Invitation[];
  isOwner: boolean;
}

const INVITE_ROLES = [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN] as const;
const INVITE_ROLES_WITH_OWNER = [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.OWNER] as const;

export const InvitationsList = ({ invitations: initialInvitations, isOwner }: InvitationsListProps) => {
  const t = useTranslations("domainAdmin.invitations");
  const tr = useTranslations("roles");
  const tc = useTranslations("common");
  const locale = useLocale();
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }), [locale]);

  const ROLE_LABELS: Record<UserRole, string> = {
    OWNER: tr("OWNER"),
    ADMIN: tr("ADMIN"),
    MODERATOR: tr("MODERATOR"),
    USER: tr("USER"),
    INHERITED: tr("INHERITED"),
  };

  const [invitations, setInvitations] = useState(initialInvitations);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<InvitationRole>("USER");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const availableRoles = isOwner ? INVITE_ROLES_WITH_OWNER : INVITE_ROLES;

  const handleSend = async () => {
    setSending(true);
    setError(null);
    const result = await sendInvitation({ email: newEmail, role: newRole });
    if (result.ok && result.data) {
      setInvitations([result.data, ...invitations]);
      setNewEmail("");
      setNewRole("USER");
    } else if (!result.ok) {
      setError(result.error);
    }
    setSending(false);
  };

  const handleRevoke = async (id: number) => {
    if (!confirm(tc("areYouSure"))) return;
    const result = await revokeInvitation({ id });
    if (result.ok) {
      setInvitations(invitations.filter(i => i.id !== id));
      setError(null);
    } else if (!result.ok) {
      setError(result.error);
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{tc("error")}</AlertTitle>
          <AlertDescription className="flex items-start justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="size-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {invitations.length > 0 ? (
        <Table className="mb-6">
          <TableHeader>
            <TableRow>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("createdAt")}</TableHead>
              <TableHead>{tc("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map(invitation => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ROLE_LABELS[invitation.role]}</Badge>
                </TableCell>
                <TableCell>
                  {invitation.acceptedAt ? (
                    <Badge variant="default">{t("accepted")}</Badge>
                  ) : (
                    <Badge variant="secondary">{t("pending")}</Badge>
                  )}
                </TableCell>
                <TableCell>{dateFormatter.format(new Date(invitation.createdAt))}</TableCell>
                <TableCell>
                  {!invitation.acceptedAt && (
                    <Button variant="secondary" size="sm" onClick={() => void handleRevoke(invitation.id)}>
                      {tc("revoke")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Alert className="mb-6">
          <AlertTitle>{t("noInvitations")}</AlertTitle>
          <AlertDescription>{t("noInvitationsDescription")}</AlertDescription>
        </Alert>
      )}

      <h2 className="text-lg font-semibold mb-4">{t("sendInvitation")}</h2>
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-48 space-y-2">
          <Label htmlFor="invite-email">{t("email")}</Label>
          <Input
            id="invite-email"
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            autoComplete="off"
            name="invite-email"
          />
        </div>
        <div className="w-48 space-y-2">
          <Label htmlFor="invite-role">{t("role")}</Label>
          <select
            id="invite-role"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={newRole}
            onChange={e => setNewRole(e.target.value as InvitationRole)}
          >
            {availableRoles.map(role => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => void handleSend()} disabled={!newEmail || sending}>
          {sending ? t("sending") : t("send")}
        </Button>
      </div>
    </div>
  );
};
