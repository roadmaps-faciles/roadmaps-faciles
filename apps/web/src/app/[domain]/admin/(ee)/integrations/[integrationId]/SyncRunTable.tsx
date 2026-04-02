"use client";

import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roadmaps-faciles/ui";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { type SyncRunSummary } from "@/lib/repo/IIntegrationSyncLogRepo";
import { formatDateHour } from "@/utils/date";

interface SyncRunTableProps {
  runs: SyncRunSummary[];
}

export const SyncRunTable = ({ runs }: SyncRunTableProps) => {
  const t = useTranslations("domainAdmin.integrations.detail");
  const locale = useLocale();
  const [expandedRunId, setExpandedRunId] = useState<null | string>(null);

  if (runs.length === 0) {
    return <p className="text-muted-foreground">{t("noLogs")}</p>;
  }

  const expandedRun = expandedRunId ? runs.find(r => r.syncRunId === expandedRunId) : null;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("logDate")}</TableHead>
            <TableHead>{t("logDirection")}</TableHead>
            <TableHead>{t("runResult")}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map(run => {
            const hasErrors = run.errors > 0 || run.conflicts > 0;

            return (
              <TableRow key={run.syncRunId}>
                <TableCell className="text-xs">{formatDateHour(run.startedAt, locale)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{t(`runDirection_${run.direction}` as never)}</Badge>
                </TableCell>
                <TableCell>
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge variant={run.errors > 0 ? "destructive" : run.conflicts > 0 ? "secondary" : "default"}>
                      {t("runSynced", { count: run.success })}
                    </Badge>
                    {run.errors > 0 && <Badge variant="destructive">{t("runErrors", { count: run.errors })}</Badge>}
                    {run.conflicts > 0 && (
                      <Badge variant="secondary">{t("runConflicts", { count: run.conflicts })}</Badge>
                    )}
                    {run.skipped > 0 && <Badge variant="outline">{t("runSkipped", { count: run.skipped })}</Badge>}
                  </span>
                </TableCell>
                <TableCell>
                  {hasErrors ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedRunId(expandedRunId === run.syncRunId ? null : run.syncRunId)}
                    >
                      {expandedRunId === run.syncRunId ? (
                        <ChevronUp className="mr-1 size-4" />
                      ) : (
                        <ChevronDown className="mr-1 size-4" />
                      )}
                      {t("runDetails", { count: run.errorDetails.length })}
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {expandedRun && expandedRun.errorDetails.length > 0 && (
        <div className="mb-6 rounded-md bg-muted p-4">
          <p className="mb-2 text-sm font-bold">{t("runErrorsTitle")}</p>
          <ul className="text-sm">
            {expandedRun.errorDetails.map((detail, i) => (
              <li key={i} className="mb-1">
                {detail.message ?? t("runUnknownError")}
                {detail.postId && <span className="text-muted-foreground"> (post #{detail.postId})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
