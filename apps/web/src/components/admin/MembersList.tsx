"use client";

import { cn } from "@roadmaps-faciles/ui";
import { Alert, AlertDescription, AlertTitle } from "@roadmaps-faciles/ui/components/alert";
import { Badge } from "@roadmaps-faciles/ui/components/badge";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Label } from "@roadmaps-faciles/ui/components/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roadmaps-faciles/ui/components/table";
import { ArrowDown, ArrowUp, Check, Copy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { type UserOnTenantWithUser } from "@/lib/repo/IUserOnTenantRepo";
import { UserRole, UserStatus } from "@/prisma/enums";
import { type ServerActionResponse } from "@/utils/next";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

export interface MembersListActions {
  onRemove: (data: { userId: string }) => Promise<ServerActionResponse>;
  onUpdateRole: (data: { role: UserRole; userId: string }) => Promise<ServerActionResponse>;
  onUpdateStatus: (data: { status: UserStatus; userId: string }) => Promise<ServerActionResponse>;
}

export interface MembersListProps extends MembersListActions {
  currentUserId: string;
  members: UserOnTenantWithUser[];
  superAdminIds?: string[];
}

const STATUS_BADGE_VARIANT: Record<UserStatus, "default" | "destructive" | "outline" | "secondary"> = {
  ACTIVE: "default",
  BLOCKED: "secondary",
  DELETED: "destructive",
};

const ROLE_WEIGHT: Record<UserRole, number> = {
  OWNER: 0,
  ADMIN: 1,
  MODERATOR: 2,
  USER: 3,
  INHERITED: 4,
};

const STATUS_WEIGHT: Record<UserStatus, number> = {
  ACTIVE: 0,
  BLOCKED: 1,
  DELETED: 2,
};

const ASSIGNABLE_ROLES = [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.OWNER] as const;

const FILTERABLE_ROLES = [UserRole.OWNER, UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER] as const;

/** For INHERITED members, the effective role is the root (User) role. */
const getEffectiveRole = (member: UserOnTenantWithUser): UserRole =>
  member.role === UserRole.INHERITED ? member.user.role : member.role;

type SortDirection = "asc" | "desc";
type SortKey = "email" | "joinedAt" | "name" | "role" | "status";

export const MembersList = ({
  members: initialMembers,
  currentUserId,
  superAdminIds = [],
  onUpdateRole,
  onUpdateStatus,
  onRemove,
}: MembersListProps) => {
  const t = useTranslations("domainAdmin.users");
  const tr = useTranslations("roles");
  const ts = useTranslations("memberStatus");
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

  const STATUS_LABELS: Record<UserStatus, string> = {
    ACTIVE: ts("ACTIVE"),
    BLOCKED: ts("BLOCKED"),
    DELETED: ts("DELETED"),
  };

  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState<null | string>(null);
  const [loadingId, setLoadingId] = useState<null | string>(null);
  const [copiedId, setCopiedId] = useState<null | string>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<null | number>(DEFAULT_PAGE_SIZE);
  const [filterRole, setFilterRole] = useState<null | UserRole>(null);
  const [filterStatus, setFilterStatus] = useState<null | UserStatus>(null);

  const ownerCount = useMemo(
    () => members.filter(m => m.role === UserRole.OWNER && m.status === UserStatus.ACTIVE).length,
    [members],
  );
  const isLastOwner = (member: UserOnTenantWithUser) => member.role === UserRole.OWNER && ownerCount <= 1;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (filterRole && getEffectiveRole(m) !== filterRole) return false;
      if (filterStatus && m.status !== filterStatus) return false;
      return true;
    });
  }, [members, filterRole, filterStatus]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.user.name ?? "").localeCompare(b.user.name ?? "");
          break;
        case "email":
          cmp = a.user.email.localeCompare(b.user.email);
          break;
        case "role":
          cmp = ROLE_WEIGHT[getEffectiveRole(a)] - ROLE_WEIGHT[getEffectiveRole(b)];
          break;
        case "status":
          cmp = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
          break;
        case "joinedAt":
          cmp = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredMembers, sortKey, sortDir]);

  const totalPages = pageSize ? Math.ceil(sortedMembers.length / pageSize) : 1;
  const paginatedMembers = pageSize
    ? sortedMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedMembers;

  const copyTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopyId = (userId: string) => {
    void navigator.clipboard.writeText(userId);
    setCopiedId(userId);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setLoadingId(userId);
    setError(null);
    const result = await onUpdateRole({ userId, role });
    if (result.ok) {
      setMembers(prev => prev.map(m => (m.userId === userId ? { ...m, role } : m)));
    } else if (!result.ok) {
      setError(result.error);
    }
    setLoadingId(null);
  };

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === UserStatus.BLOCKED ? UserStatus.ACTIVE : UserStatus.BLOCKED;
    setLoadingId(userId);
    setError(null);
    const result = await onUpdateStatus({ userId, status: newStatus });
    if (result.ok) {
      setMembers(prev => prev.map(m => (m.userId === userId ? { ...m, status: newStatus } : m)));
    } else if (!result.ok) {
      setError(result.error);
    }
    setLoadingId(null);
  };

  const handleRemove = async (userId: string) => {
    if (!confirm(t("removeConfirm"))) return;
    setLoadingId(userId);
    setError(null);
    const result = await onRemove({ userId });
    if (result.ok) {
      setMembers(prev => prev.filter(m => m.userId !== userId));
    } else if (!result.ok) {
      setError(result.error);
    }
    setLoadingId(null);
  };

  const isSelf = (member: UserOnTenantWithUser) => member.userId === currentUserId;

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : null;

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{tc("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
        <p className="text-sm text-muted-foreground">
          {t("memberCount", {
            filtered: filteredMembers.length === members.length ? "same" : String(filteredMembers.length),
            total: members.length,
          })}
        </p>
        <div className="flex items-end flex-wrap gap-4">
          <div className="space-y-1">
            <Label htmlFor="filter-role" className="text-xs">
              {t("role")}
            </Label>
            <select
              id="filter-role"
              className="flex h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filterRole ?? "all"}
              onChange={e => {
                setFilterRole(e.target.value === "all" ? null : (e.target.value as UserRole));
                setCurrentPage(1);
              }}
            >
              <option value="all">{tc("all")}</option>
              {FILTERABLE_ROLES.map(role => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-status" className="text-xs">
              {t("status")}
            </Label>
            <select
              id="filter-status"
              className="flex h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={filterStatus ?? "all"}
              onChange={e => {
                setFilterStatus(e.target.value === "all" ? null : (e.target.value as UserStatus));
                setCurrentPage(1);
              }}
            >
              <option value="all">{tc("all")}</option>
              {Object.values(UserStatus).map(status => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 ml-auto">
            <Label htmlFor="page-size" className="text-xs">
              {tc("perPage")}
            </Label>
            <select
              id="page-size"
              className="flex h-8 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={pageSize ? String(pageSize) : "all"}
              onChange={e => {
                const val = e.target.value;
                setPageSize(val === "all" ? null : Number(val));
                setCurrentPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={String(size)}>
                  {size}
                </option>
              ))}
              <option value="all">{tc("all")}</option>
            </select>
          </div>
        </div>
      </div>

      {members.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">{t("id")}</TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => toggleSort("name")}
                  >
                    {t("name")} {sortIndicator("name")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => toggleSort("email")}
                  >
                    {t("email")} {sortIndicator("email")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => toggleSort("role")}
                  >
                    {t("role")} {sortIndicator("role")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => toggleSort("status")}
                  >
                    {t("status")} {sortIndicator("status")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-foreground"
                    onClick={() => toggleSort("joinedAt")}
                  >
                    {t("joinedAt")} {sortIndicator("joinedAt")}
                  </button>
                </TableHead>
                <TableHead>{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map(member => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={member.userId}
                      onClick={() => handleCopyId(member.userId)}
                    >
                      {copiedId === member.userId ? (
                        <Check className="size-4 text-primary" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {member.user.name ?? "-"}
                      {isSelf(member) && (
                        <Badge variant="outline" className="text-xs">
                          {t("you")}
                        </Badge>
                      )}
                      {superAdminIds.includes(member.userId) && (
                        <Badge variant="outline" className="text-xs">
                          {t("superAdmin")}
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>
                    {isLastOwner(member) || isSelf(member) || member.role === UserRole.INHERITED ? (
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary">{ROLE_LABELS[getEffectiveRole(member)]}</Badge>
                        {member.role === UserRole.INHERITED && <Badge variant="outline">{t("inherited")}</Badge>}
                      </span>
                    ) : (
                      <select
                        className={cn(
                          "flex h-8 min-w-36 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        )}
                        value={member.role}
                        onChange={e => void handleRoleChange(member.userId, e.target.value as UserRole)}
                        disabled={loadingId === member.userId}
                      >
                        {ASSIGNABLE_ROLES.map(role => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[member.status]}>{STATUS_LABELS[member.status]}</Badge>
                  </TableCell>
                  <TableCell>{dateFormatter.format(new Date(member.joinedAt))}</TableCell>
                  <TableCell>
                    {!isLastOwner(member) && !isSelf(member) && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={loadingId === member.userId}
                          onClick={() => void handleRemove(member.userId)}
                        >
                          {t("remove")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loadingId === member.userId}
                          onClick={() => void handleToggleStatus(member.userId, member.status)}
                        >
                          {member.status === UserStatus.BLOCKED ? t("unblock") : t("block")}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                &laquo;
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                &raquo;
              </Button>
            </div>
          )}
        </>
      ) : (
        <Alert>
          <AlertTitle>{t("noMembers")}</AlertTitle>
          <AlertDescription>{t("noMembersDescription")}</AlertDescription>
        </Alert>
      )}
    </>
  );
};
