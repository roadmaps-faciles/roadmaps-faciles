import { type IntegrationSyncLog, type Prisma } from "@/prisma/client";

export interface SyncRunSummary {
  conflicts: number;
  direction: "BIDIRECTIONAL" | "INBOUND" | "OUTBOUND";
  errorDetails: Array<{ message: null | string; postId?: number }>;
  errors: number;
  skipped: number;
  startedAt: Date;
  success: number;
  syncRunId: string;
  total: number;
}

export interface IIntegrationSyncLogRepo {
  create(data: Prisma.IntegrationSyncLogUncheckedCreateInput): Promise<IntegrationSyncLog>;
  findRecentForIntegration(integrationId: number, limit?: number): Promise<IntegrationSyncLog[]>;
  findSyncRuns(integrationId: number, limit?: number): Promise<SyncRunSummary[]>;
}
