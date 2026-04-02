import { z } from "zod";

import { ApiKey, type ApiKey as ApiKeyModel } from "@/lib/model/ApiKey";
import { type IApiKeyRepo } from "@/lib/repo/IApiKeyRepo";

import { type UseCase } from "../../types";

export const CreateApiKeyInput = z.object({
  tenantId: z.number(),
  userId: z.string(),
  commonTokenPrefix: z.string(),
  randomTokenPrefix: z.string(),
  tokenDigest: z.string(),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInput>;
export type CreateApiKeyOutput = ApiKeyModel;

export class CreateApiKey implements UseCase<CreateApiKeyInput, CreateApiKeyOutput> {
  constructor(private readonly apiKeyRepo: IApiKeyRepo) {}

  public async execute(input: CreateApiKeyInput): Promise<CreateApiKeyOutput> {
    const result = await this.apiKeyRepo.create({
      tenantId: input.tenantId,
      userId: input.userId,
      commonTokenPrefix: input.commonTokenPrefix,
      randomTokenPrefix: input.randomTokenPrefix,
      tokenDigest: input.tokenDigest,
    });

    return ApiKey.parse(result);
  }
}
