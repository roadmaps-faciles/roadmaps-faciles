import { type Post as PostModel } from "@/lib/model/Post";
import { type IPostRepo } from "@/lib/repo/IPostRepo";
import { notImplemented } from "@/utils/error";

import { type UseCase } from "../types";

export interface ListApprovedPostsForBoardInput {
  boardId: number;
  tenantId: number;
}

export class ListApprovedPostsForBoard implements UseCase<ListApprovedPostsForBoardInput, PostModel[]> {
  constructor(private readonly postRepo: IPostRepo) {}

  public execute(_input: ListApprovedPostsForBoardInput): Promise<PostModel[]> {
    return notImplemented();
    // const posts = await this.postRepo.findAll();

    // return posts
    //   .filter(p => p.boardId === input.boardId && p.tenantId === input.tenantId && p.postStatusId !== null)
    //   .map(p => {
    //     // enrichir comme dans controller : hotness, liked, etc.
    //     return Post.parse({
    //       ...p,
    //       likesCount: p.likesCount,
    //       commentsCount: p.commentsCount,
    //       hotness: Math.log(p.likesCount + 1) + Math.log(p.commentsCount + 1) + p.createdAt.getTime() / 45000,
    //       liked: false, // par défaut ici
    //       isApproved: p.postStatusId !== null,
    //     });
    //   });
  }
}
