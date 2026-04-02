import { z } from "zod";

import { type IWebhookRepo } from "@/lib/repo/IWebhookRepo";
import { type Webhook } from "@/prisma/client";

import { type UseCase } from "../../types";

export const ListWebhooksForTenantInput = z.object({
  tenantId: z.number(),
});

export type ListWebhooksForTenantInput = z.infer<typeof ListWebhooksForTenantInput>;
export type ListWebhooksForTenantOutput = Webhook[];

export class ListWebhooksForTenant implements UseCase<ListWebhooksForTenantInput, ListWebhooksForTenantOutput> {
  constructor(private readonly webhookRepo: IWebhookRepo) {}

  public async execute(input: ListWebhooksForTenantInput): Promise<ListWebhooksForTenantOutput> {
    return this.webhookRepo.findAllForTenant(input.tenantId);
  }
}
