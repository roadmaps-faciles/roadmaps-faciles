import { z } from "zod";

import { type IWebhookRepo } from "@/lib/repo/IWebhookRepo";

import { type UseCase } from "../../types";

export const DeleteWebhookInput = z.object({
  id: z.number(),
});

export type DeleteWebhookInput = z.infer<typeof DeleteWebhookInput>;
export type DeleteWebhookOutput = void;

export class DeleteWebhook implements UseCase<DeleteWebhookInput, DeleteWebhookOutput> {
  constructor(private readonly webhookRepo: IWebhookRepo) {}

  public async execute(input: DeleteWebhookInput): Promise<DeleteWebhookOutput> {
    await this.webhookRepo.delete(input.id);
  }
}
