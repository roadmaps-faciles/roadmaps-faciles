"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Label,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@roadmaps-faciles/ui";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";

import { type UserWithTenantCount } from "@/lib/repo/IUserRepo";
import { UserRole, UserStatus } from "@/prisma/enums";

import { updateUserRole, updateUserStatus } from "./actions";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<UserStatus, "default" | "destructive" | "secondary"> = {
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

const ASSIGNABLE_ROLES = [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN] as const;

const FILTERABLE_ROLES = [UserRole.ADMIN, UserRole.MODERATOR, UserRole.USER] as const;

type SortDirection = "asc" | "desc";
type SortKey = "createdAt" | "email" | "name" | "role" | "status" | "tenants";

interface GlobalUsersListProps {
  currentUserId: string;
  superAdminIds: string[];
  users: UserWithTenantCount[];
}

const getPageNumbers = (currentPage: number, totalPages: number): Array<"ellipsis" | number> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: Array<"ellipsis" | number> = [1];
  if (currentPage > 3) pages.push("ellipsis");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - 2) pages.push("ellipsis");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
};

export const GlobalUsersList = ({ users: initialUsers, currentUserId, superAdminIds }: GlobalUsersListProps) => {
  const t = useTranslations("adminUsers");
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

  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<null | string>(null);
  const [loadingId, setLoadingId] = useState<null | string>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<null | number>(DEFAULT_PAGE_SIZE);
  const [filterRole, setFilterRole] = useState<null | UserRole>(null);
  const [filterStatus, setFilterStatus] = useState<null | UserStatus>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (filterRole && u.role !== filterRole) return false;
      if (filterStatus && u.status !== filterStatus) return false;
      return true;
    });
  }, [users, filterRole, filterStatus]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.name ?? "").localeCompare(b.name ?? "");
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "role":
          cmp = ROLE_WEIGHT[a.role] - ROLE_WEIGHT[b.role];
          break;
        case "status":
          cmp = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
          break;
        case "tenants":
          cmp = a._count.memberships - b._count.memberships;
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredUsers, sortKey, sortDir]);

  const totalPages = pageSize ? Math.ceil(sortedUsers.length / pageSize) : 1;
  const paginatedUsers = pageSize
    ? sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedUsers;

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setLoadingId(userId);
    setError(null);
    const result = await updateUserRole({ userId, role });
    if (result.ok) {
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)));
    } else if (!result.ok) {
      setError(result.error);
    }
    setLoadingId(null);
  };

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === UserStatus.BLOCKED ? UserStatus.ACTIVE : UserStatus.BLOCKED;
    setLoadingId(userId);
    setError(null);
    const result = await updateUserStatus({ userId, status: newStatus });
    if (result.ok) {
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status: newStatus } : u)));
    } else if (!result.ok) {
      setError(result.error);
    }
    setLoadingId(null);
  };

  const isSelf = (userId: string) => userId === currentUserId;

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="ml-1 inline size-3 text-muted-foreground" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline size-3" />
    ) : (
      <ArrowDown className="ml-1 inline size-3" />
    );
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>{tc("error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t("userCount", {
            filtered: filteredUsers.length === users.length ? "same" : String(filteredUsers.length),
            total: users.length,
          })}
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="filter-role" className="text-xs">
              {t("role")}
            </Label>
            <Select
              value={filterRole ?? "all"}
              onValueChange={v => {
                setFilterRole(v === "all" ? null : (v as UserRole));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="filter-role" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc("all")}</SelectItem>
                {FILTERABLE_ROLES.map(role => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-status" className="text-xs">
              {t("status")}
            </Label>
            <Select
              value={filterStatus ?? "all"}
              onValueChange={v => {
                setFilterStatus(v === "all" ? null : (v as UserStatus));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="filter-status" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tc("all")}</SelectItem>
                {Object.values(UserStatus).map(status => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto space-y-1">
            <Label htmlFor="filter-page-size" className="text-xs">
              {tc("perPage")}
            </Label>
            <Select
              value={pageSize ? String(pageSize) : "all"}
              onValueChange={v => {
                setPageSize(v === "all" ? null : Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger id="filter-page-size" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {String(size)}
                  </SelectItem>
                ))}
                <SelectItem value="all">{tc("all")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {users.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {(
                  [
                    ["name", t("name")],
                    ["email", t("email")],
                    ["role", t("role")],
                    ["status", t("status")],
                    ["tenants", t("tenants")],
                    ["createdAt", t("registeredAt")],
                  ] as Array<[SortKey, string]>
                ).map(([key, label]) => (
                  <TableHead key={key}>
                    <button
                      type="button"
                      className="inline-flex items-center hover:text-foreground"
                      onClick={() => toggleSort(key)}
                    >
                      {label}
                      <SortIcon columnKey={key} />
                    </button>
                  </TableHead>
                ))}
                <TableHead>{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {user.name ?? "-"}
                      {isSelf(user.id) && <Badge variant="outline">{t("you")}</Badge>}
                      {superAdminIds.includes(user.id) && <Badge variant="outline">{t("superAdmin")}</Badge>}
                    </span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {isSelf(user.id) || !(ASSIGNABLE_ROLES as readonly string[]).includes(user.role) ? (
                      <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={v => void handleRoleChange(user.id, v as UserRole)}
                        disabled={loadingId === user.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNABLE_ROLES.map(role => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[user.status]}>{STATUS_LABELS[user.status]}</Badge>
                  </TableCell>
                  <TableCell>{user._count.memberships}</TableCell>
                  <TableCell>{dateFormatter.format(new Date(user.createdAt))}</TableCell>
                  <TableCell>
                    {!isSelf(user.id) && (
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}`}>{tc("edit")}</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loadingId === user.id}
                          onClick={() => void handleToggleStatus(user.id, user.status)}
                        >
                          {user.status === UserStatus.BLOCKED ? t("unblock") : t("block")}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(p => Math.max(1, p - 1));
                    }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {getPageNumbers(currentPage, totalPages).map((page, i) =>
                  page === "ellipsis" ? (
                    <PaginationItem key={`e${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={e => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                    }}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <Alert>
          <AlertTitle>{t("noUsers")}</AlertTitle>
          <AlertDescription>{t("noUsersDescription")}</AlertDescription>
        </Alert>
      )}
    </>
  );
};
