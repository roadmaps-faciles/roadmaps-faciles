import { prisma } from "@/lib/db/prisma";
import { type Prisma, type Webhook } from "@/prisma/client";

import { type IWebhookRepo } from "../IWebhookRepo";

export class WebhookRepoPrisma implements IWebhookRepo {
  public findAll(): Promise<Webhook[]> {
    return prisma.webhook.findMany();
  }

  public findById(id: number): Promise<null | Webhook> {
    return prisma.webhook.findUnique({ where: { id } });
  }

  public create(data: Prisma.WebhookUncheckedCreateInput): Promise<Webhook> {
    return prisma.webhook.create({ data });
  }

  public findAllForTenant(tenantId: number): Promise<Webhook[]> {
    return prisma.webhook.findMany({ where: { tenantId }, orderBy: { createdAt: "asc" } });
  }

  public async delete(id: number): Promise<void> {
    await prisma.webhook.delete({ where: { id } });
  }
}
