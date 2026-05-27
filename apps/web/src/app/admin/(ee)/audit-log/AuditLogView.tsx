"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@roadmaps-faciles/ui";
import { Activity, AlertTriangle, Download, Info, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { type AuditLogWithUser } from "@/lib/repo/IAuditLogRepo";
import { type AuditAction } from "@/prisma/enums";
import { formatDateHour } from "@/utils/date";

import { exportAuditLogCSV } from "./actions";

interface AuditLogViewProps {
  actions: AuditAction[];
  items: AuditLogWithUser[];
  locale: string;
  page: number;
  pageSize: number;
  stats: {
    errorRate: number;
    todayCount: number;
    totalCount: number;
    uniqueUsers: number;
  };
  total: number;
}

const formatMetadata = (metadata: unknown): string => {
  if (!metadata || (typeof metadata === "object" && Object.keys(metadata).length === 0)) return "";
  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return JSON.stringify(metadata);
  }
};

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

export const AuditLogView = ({ actions, items, locale, page, pageSize, stats, total }: AuditLogViewProps) => {
  const t = useTranslations("rootAdmin.auditLog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [exporting, setExporting] = useState(false);

  const totalPages = Math.ceil(total / pageSize);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push(pathname);
  };

  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNum > 1) {
      params.set("page", String(pageNum));
    } else {
      params.delete("page");
    }
    return `${pathname}?${params.toString()}`;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportAuditLogCSV({
        action: searchParams.get("action") || undefined,
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
      });
      if (!result.ok) return;

      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <TooltipProvider>
      <div>
        {/* Dashboard cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("statTotal")}</CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("statToday")}</CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("statUniqueUsers")}</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("statErrorRate")}</CardTitle>
              <AlertTriangle className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.errorRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <div className="space-y-1">
            <Label htmlFor="filter-action" className="text-xs">
              {t("filterAction")}
            </Label>
            <Select
              value={searchParams.get("action") ?? ""}
              onValueChange={v => updateFilter("action", v === "_all" ? "" : v)}
            >
              <SelectTrigger id="filter-action">
                <SelectValue placeholder={t("allActions")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">{t("allActions")}</SelectItem>
                {actions.map(action => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-date-from" className="text-xs">
              {t("filterDateFrom")}
            </Label>
            <Input
              id="filter-date-from"
              type="date"
              value={searchParams.get("dateFrom") ?? ""}
              onChange={e => updateFilter("dateFrom", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="filter-date-to" className="text-xs">
              {t("filterDateTo")}
            </Label>
            <Input
              id="filter-date-to"
              type="date"
              value={searchParams.get("dateTo") ?? ""}
              onChange={e => updateFilter("dateTo", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              {t("resetFilters")}
            </Button>
            <Button variant="ghost" size="sm" disabled={exporting} onClick={() => void handleExport()}>
              <Download className={exporting ? "size-4 animate-pulse" : "size-4"} />
              {exporting ? t("exporting") : t("export")}
            </Button>
          </div>
        </div>

        <p className="mb-2 text-sm text-muted-foreground">
          {total} {t("results")}
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("action")}</TableHead>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("tenant")}</TableHead>
              <TableHead>{t("target")}</TableHead>
              <TableHead>{t("details")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("ip")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => {
              const userName = item.user?.name ?? item.user?.email ?? null;
              const metadata = formatMetadata(item.metadata);

              return (
                <TableRow key={item.id}>
                  <TableCell className="text-xs">{formatDateHour(new Date(item.createdAt), locale)}</TableCell>
                  <TableCell>
                    <code className="text-xs">{item.action}</code>
                  </TableCell>
                  <TableCell>
                    {item.userId ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help text-xs">{userName ?? `${item.userId.slice(0, 8)}…`}</span>
                        </TooltipTrigger>
                        <TooltipContent>{item.userId}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>{item.tenantId ? `#${item.tenantId}` : "-"}</TableCell>
                  <TableCell>
                    {item.targetType ? (
                      <span className="text-xs">
                        {item.targetType}
                        {item.targetId ? ` #${item.targetId}` : ""}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {metadata ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            <Info className="size-4 text-muted-foreground" />
                            <span className="sr-only">{t("details")}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-100">
                          <pre className="whitespace-pre-wrap text-xs">{metadata}</pre>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {item.success ? (
                      <Badge variant="default">{t("successLabel")}</Badge>
                    ) : (
                      <Badge variant="destructive">{t("errorLabel")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{item.ipAddress ?? "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={getPageUrl(Math.max(1, page - 1))}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`e${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink href={getPageUrl(p)} isActive={p === page}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href={getPageUrl(Math.min(totalPages, page + 1))}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </TooltipProvider>
  );
};
