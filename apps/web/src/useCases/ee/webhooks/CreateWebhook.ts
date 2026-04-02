import { z } from "zod";

import { type IWebhookRepo } from "@/lib/repo/IWebhookRepo";
import { type Webhook } from "@/prisma/client";

import { type UseCase } from "../../types";

const WEBHOOK_EVENTS = [
  "post.created",
  "post.status_changed",
  "comment.created",
  "like.added",
  "invitation.accepted",
] as const;

export const CreateWebhookInput = z.object({
  tenantId: z.number(),
  url: z.string().url(),
  event: z.enum(WEBHOOK_EVENTS),
});

export type CreateWebhookInput = z.infer<typeof CreateWebhookInput>;
export type CreateWebhookOutput = Webhook;

export class CreateWebhook implements UseCase<CreateWebhookInput, CreateWebhookOutput> {
  constructor(private readonly webhookRepo: IWebhookRepo) {}

  public async execute(input: CreateWebhookInput): Promise<CreateWebhookOutput> {
    return this.webhookRepo.create({
      tenantId: input.tenantId,
      url: input.url,
      event: input.event,
    });
  }
}
