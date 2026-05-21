"use client";

import {
  Badge,
  Button,
  Input,
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
  toast,
} from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useTransition } from "react";

import { type License, type LicensePlan, type ListLicensesFilters } from "@/lib/ee/licensing/adminClient";

import { listLicensesAdminAction } from "./actions";
import { CreateLicenseDialog } from "./CreateLicenseDialog";
import { LicenseDetailDialog } from "./LicenseDetailDialog";

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");

const rowStatus = (license: License): "active" | "expired" | "revoked" => {
  if (license.revokedAt) return "revoked";
  if (new Date(license.expiresAt) < new Date()) return "expired";
  return "active";
};

export const LicensingManagementView = () => {
  const t = useTranslations("rootAdmin.licensing.management");

  const [licenses, setLicenses] = useState<License[]>([]);
  const [nextCursor, setNextCursor] = useState<null | string>(null);
  const [planFilter, setPlanFilter] = useState<"all" | LicensePlan>("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "all" | "expired" | "revoked">("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<null | string>(null);
  const [pending, startTransition] = useTransition();

  const fetchLicenses = useCallback(
    (cursor?: string) => {
      const filters: ListLicensesFilters = {};
      if (planFilter !== "all") filters.plan = planFilter;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (search) filters.q = search;
      if (cursor) filters.cursor = cursor;

      startTransition(async () => {
        const result = await listLicensesAdminAction(filters);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        setLicenses(prev => (cursor ? [...prev, ...result.data.data] : result.data.data));
        setNextCursor(result.data.nextCursor);
      });
    },
    [planFilter, statusFilter, search],
  );

  useEffect(() => {
    const t = setTimeout(() => fetchLicenses(), 300);
    return () => clearTimeout(t);
  }, [fetchLicenses]);

  const refresh = () => fetchLicenses();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("filters.plan")}</span>
          <Select value={planFilter} onValueChange={v => setPlanFilter(v as typeof planFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.planAll")}</SelectItem>
              <SelectItem value="GOV_LICENSED">GOV_LICENSED</SelectItem>
              <SelectItem value="LICENSED">LICENSED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("filters.status")}</span>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.statusAll")}</SelectItem>
              <SelectItem value="active">{t("filters.statusActive")}</SelectItem>
              <SelectItem value="expired">{t("filters.statusExpired")}</SelectItem>
              <SelectItem value="revoked">{t("filters.statusRevoked")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <span className="text-xs font-medium text-muted-foreground">{t("filters.search")}</span>
          <Input
            type="search"
            placeholder={t("filters.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
        </div>

        <div className="ml-auto">
          <Button onClick={() => setCreateOpen(true)}>{t("newLicense")}</Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.email")}</TableHead>
              <TableHead>{t("columns.plan")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead>{t("columns.expiresAt")}</TableHead>
              <TableHead>{t("columns.createdAt")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.length === 0 && !pending ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              licenses.map(license => {
                const status = rowStatus(license);
                return (
                  <TableRow key={license.id} className="cursor-pointer" onClick={() => setDetailId(license.id)}>
                    <TableCell className="font-medium">{license.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{license.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      {status === "active" ? (
                        <Badge className="bg-green-600 text-white">{t("rowStatus.active")}</Badge>
                      ) : status === "expired" ? (
                        <Badge variant="destructive">{t("rowStatus.expired")}</Badge>
                      ) : (
                        <Badge variant="secondary">{t("rowStatus.revoked")}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(license.expiresAt)}</TableCell>
                    <TableCell>{formatDate(license.createdAt)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {nextCursor && (
        <div className="flex justify-center">
          <Button onClick={() => fetchLicenses(nextCursor)} disabled={pending} variant="outline">
            {pending ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}

      <CreateLicenseDialog open={createOpen} onCloseAction={() => setCreateOpen(false)} onCreatedAction={refresh} />

      <LicenseDetailDialog licenseId={detailId} onCloseAction={() => setDetailId(null)} onUpdatedAction={refresh} />
    </div>
  );
};
