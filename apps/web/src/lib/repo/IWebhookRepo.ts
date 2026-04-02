import { type Prisma, type Webhook } from "@/prisma/client";

export interface IWebhookRepo {
  create(data: Prisma.WebhookUncheckedCreateInput): Promise<Webhook>;
  delete(id: number): Promise<void>;
  findAll(): Promise<Webhook[]>;
  findAllForTenant(tenantId: number): Promise<Webhook[]>;
  findById(id: number): Promise<null | Webhook>;
}
