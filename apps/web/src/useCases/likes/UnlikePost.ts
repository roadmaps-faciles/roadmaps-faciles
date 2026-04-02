import { z } from "zod";

import { type ILikeRepo } from "@/lib/repo/ILikeRepo";

import { type UseCase } from "../types";
import { LikePostInput } from "./LikePost";

export const UnlikePostInput = LikePostInput;

export type UnlikePostInput = z.infer<typeof UnlikePostInput>;
export type UnlikePostOutput = void;

export class UnlikePost implements UseCase<UnlikePostInput, UnlikePostOutput> {
  constructor(private readonly likeRepo: ILikeRepo) {}

  public async execute(input: UnlikePostInput): Promise<UnlikePostOutput> {
    const inputValidated = UnlikePostInput.safeParse(input);
    if (!inputValidated.success) {
      throw new UnlikePostError(z.prettifyError(inputValidated.error));
    }
    if (inputValidated.data.userId) {
      await this.likeRepo.deleteByUserId(inputValidated.data.userId, input.postId, input.tenantId);
    } else if (inputValidated.data.anonymousId) {
      await this.likeRepo.deleteByAnonymousId(inputValidated.data.anonymousId, input.postId, input.tenantId);
    } else throw new UnlikePostNeedsUserIdError("UnlikePost needs userId or anonymousId");
  }
}

export class UnlikePostError extends Error {
  public name = "UnlikePostError";
  constructor(message: string) {
    super(message);
  }
}

export class UnlikePostNeedsUserIdError extends UnlikePostError {
  public name = "UnlikePostNeedsUserIdError";
  constructor(message: string) {
    super(message);
  }
}
