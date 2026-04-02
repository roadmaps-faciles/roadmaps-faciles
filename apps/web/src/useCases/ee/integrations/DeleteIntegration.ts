import { type IIntegrationMappingRepo } from "@/lib/repo/IIntegrationMappingRepo";
import { type IIntegrationRepo } from "@/lib/repo/IIntegrationRepo";
import { type IPostRepo } from "@/lib/repo/IPostRepo";

import { type UseCase } from "../../types";

export interface DeleteIntegrationInput {
  cleanupInboundPosts: boolean;
  id: number;
  tenantId: number;
}

export type DeleteIntegrationOutput = { deletedPostCount: number };

export class DeleteIntegration implements UseCase<DeleteIntegrationInput, DeleteIntegrationOutput> {
  constructor(
    private readonly integrationRepo: IIntegrationRepo,
    private readonly integrationMappingRepo: IIntegrationMappingRepo,
    private readonly postRepo: IPostRepo,
  ) {}

  public async execute(input: DeleteIntegrationInput): Promise<DeleteIntegrationOutput> {
    const existing = await this.integrationRepo.findById(input.id);
    if (!existing || existing.tenantId !== input.tenantId) {
      throw new Error("Integration not found");
    }

    let deletedPostCount = 0;

    // Optionally delete posts that were imported from this integration
    if (input.cleanupInboundPosts) {
      const inboundPostIds = await this.integrationMappingRepo.findInboundPostIdsForIntegration(input.id);
      for (const postId of inboundPostIds) {
        const post = await this.postRepo.findById(postId);
        if (!post) continue;
        await this.postRepo.delete(postId);
        deletedPostCount++;
      }
    }

    // Cascade delete: mappings + sync logs are deleted via onDelete: Cascade
    await this.integrationRepo.delete(input.id);

    return { deletedPostCount };
  }
}
