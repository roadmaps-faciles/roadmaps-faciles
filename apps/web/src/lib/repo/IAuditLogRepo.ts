import { type AuditLog, type Prisma } from "@/prisma/client";
import { type AuditAction } from "@/prisma/enums";

export type AuditLogWithUser = {
  user: { email: string; name: null | string } | null;
} & AuditLog;

export type AuditLogFilter = {
  action?: AuditAction;
  dateFrom?: Date;
  dateTo?: Date;
  tenantId?: number;
  userId?: string;
};

export interface IAuditLogRepo {
  create(data: Prisma.AuditLogCreateInput): Promise<AuditLog>;
  findAll(filter: AuditLogFilter): Promise<AuditLogWithUser[]>;
  findPaginated(
    filter: AuditLogFilter,
    page: number,
    pageSize: number,
  ): Promise<{ items: AuditLogWithUser[]; total: number }>;
  getDistinctActions(tenantId?: number): Promise<AuditAction[]>;
}
