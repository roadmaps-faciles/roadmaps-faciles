import { z } from "zod";

import { type IApiKeyRepo } from "@/lib/repo/IApiKeyRepo";

import { type UseCase } from "../../types";

export const DeleteApiKeyInput = z.object({
  apiKeyId: z.number(),
});

export type DeleteApiKeyInput = z.infer<typeof DeleteApiKeyInput>;
export type DeleteApiKeyOutput = void;

export class DeleteApiKey implements UseCase<DeleteApiKeyInput, DeleteApiKeyOutput> {
  constructor(private readonly apiKeyRepo: IApiKeyRepo) {}

  public async execute(input: DeleteApiKeyInput): Promise<DeleteApiKeyOutput> {
    await this.apiKeyRepo.delete(input.apiKeyId);
  }
}
