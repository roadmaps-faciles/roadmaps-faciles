import { z } from "zod";

import { type IBoardRepo } from "@/lib/repo/IBoardRepo";
import { AppError } from "@/utils/error";

import { AbstractCachedUseCase } from "../AbstractCacheUseCase";

export const GetBoardSlugInput = z.number();

export type GetBoardSlugInput = z.infer<typeof GetBoardSlugInput>;
export type GetBoardSlugOutput = {
  slug: string;
};

export class GetBoardSlug extends AbstractCachedUseCase<GetBoardSlugInput, GetBoardSlugOutput> {
  public readonly cacheMasterKey = "GetBoardSlug";
  public readonly defaultOptions = {
    revalidate: 60 * 60, // 1 hour
  };

  constructor(private readonly boardRepo: IBoardRepo) {
    super();
  }

  public async cachedExecute(input: GetBoardSlugInput): Promise<GetBoardSlugOutput> {
    const id = GetBoardSlugInput.parse(input);
    const slug = await this.boardRepo.findSlugById(id);

    if (!slug) {
      throw new GetBoardSlugNotFoundError(`Board not found: ${id}`);
    }

    return { slug };
  }
}

export class GetBoardSlugError extends AppError {
  public readonly name: string = "GetBoardSlugError";
  constructor(message: string) {
    super(message);
  }
}

export class GetBoardSlugNotFoundError extends AppError {
  public readonly name: string = "GetBoardSlugNotFoundError";
  constructor(message: string) {
    super(message);
  }
}
