import { prisma } from "@/lib/db/prisma";
import { type IntegrationSyncLog, type Prisma } from "@/prisma/client";

import { type IIntegrationSyncLogRepo, type SyncRunSummary } from "../IIntegrationSyncLogRepo";

export class IntegrationSyncLogRepoPrisma implements IIntegrationSyncLogRepo {
  public create(data: Prisma.IntegrationSyncLogUncheckedCreateInput): Promise<IntegrationSyncLog> {
    return prisma.integrationSyncLog.create({ data });
  }

  public findRecentForIntegration(integrationId: number, limit = 50): Promise<IntegrationSyncLog[]> {
    return prisma.integrationSyncLog.findMany({
      where: { integrationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  public async findSyncRuns(integrationId: number, limit = 20): Promise<SyncRunSummary[]> {
    // Get distinct syncRunIds ordered by most recent
    const runs = await prisma.integrationSyncLog.findMany({
      where: { integrationId, syncRunId: { not: null } },
      distinct: ["syncRunId"],
      orderBy: { createdAt: "desc" },
      select: { syncRunId: true },
      take: limit,
    });

    const runIds = runs.map(r => r.syncRunId!);
    if (runIds.length === 0) return [];

    // Fetch all logs for these runs in one query
    const logs = await prisma.integrationSyncLog.findMany({
      where: { integrationId, syncRunId: { in: runIds } },
      orderBy: { createdAt: "asc" },
    });

    // Group and aggregate
    const grouped = new Map<string, IntegrationSyncLog[]>();
    for (const log of logs) {
      const id = log.syncRunId!;
      if (!grouped.has(id)) grouped.set(id, []);
      grouped.get(id)!.push(log);
    }

    return runIds.map(runId => {
      const runLogs = grouped.get(runId) ?? [];

      // Direction: derived from ALL logs (including phase markers)
      const directions = new Set(runLogs.map(l => l.direction));
      const direction: SyncRunSummary["direction"] =
        directions.size > 1
          ? "BIDIRECTIONAL"
          : ((directions.values().next().value ?? "OUTBOUND") as "INBOUND" | "OUTBOUND");

      // Counts: exclude phase markers so they don't inflate visible numbers
      const itemLogs = runLogs.filter(l => l.message !== "phase_marker");
      const success = itemLogs.filter(l => l.status === "SUCCESS").length;
      const errors = itemLogs.filter(l => l.status === "ERROR").length;
      const conflicts = itemLogs.filter(l => l.status === "CONFLICT").length;
      const skipped = itemLogs.filter(l => l.status === "SKIPPED").length;

      const errorDetails = itemLogs
        .filter(l => l.status === "ERROR" || l.status === "CONFLICT")
        .map(l => ({
          message: l.message,
          postId: (l.details as null | Record<string, unknown>)?.postId as number | undefined,
        }));

      return {
        syncRunId: runId,
        startedAt: runLogs[0]?.createdAt ?? new Date(),
        direction,
        total: itemLogs.length,
        success,
        errors,
        conflicts,
        skipped,
        errorDetails,
      };
    });
  }
}
