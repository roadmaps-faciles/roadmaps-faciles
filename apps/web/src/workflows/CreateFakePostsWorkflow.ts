import { fakerFR as faker } from "@faker-js/faker";

import { config } from "@/config";
import { prisma } from "@/lib/db/prisma";
import { getSeedTenant } from "@/lib/seedContext";
import { type Comment, type Follow, type Like } from "@/prisma/client";

import { type IWorkflow } from "./IWorkflow";

const MIN_POSTS = config.seed.minFakePosts || 64; // Default to 64 if not set in config
const MAX_POSTS = config.seed.maxFakePosts || 256; // Default to 256 if not set in config
const MAX_LIKES = config.seed.maxFakeLikesPerPost || 128; // Default to 128 if not set in config
const MAX_COMMENTS = config.seed.maxFakeCommentsPerPost || 16; // Default to 16 if not set in config
const MAX_REPLIES = config.seed.maxRepliesPerComment || 8; // Default to 8 if not set in config

const POSTS_COUNT = faker.number.int({ min: MIN_POSTS, max: MAX_POSTS });
export class CreateFakePostsWorkflow implements IWorkflow {
  public async run() {
    const tenant = getSeedTenant();

    const usersOnTenant = await prisma.userOnTenant.findMany({
      where: {
        tenantId: tenant.id,
      },
    });

    const MAX_FOLLOWS = usersOnTenant.length;

    const boards = await prisma.board.findMany({
      where: {
        tenantId: tenant.id,
      },
    });

    const postStatuses = await prisma.postStatus.findMany({
      where: {
        tenantId: tenant.id,
      },
    });

    const previousPostCount = await prisma.post.count();

    const pinnedBoards = new Set<number>();
    for (let i = 0; i < POSTS_COUNT; i++) {
      const randomUserOnTenant = faker.helpers.arrayElement(usersOnTenant);
      const randomBoard = faker.helpers.arrayElement(boards);
      const randomPostStatus = faker.helpers.arrayElement(postStatuses);
      const title = faker.lorem.sentence({ max: 6, min: 3 });

      const randomPastDate = faker.date.past();
      const post = await prisma.post.create({
        data: {
          title,
          slug: faker.helpers.slugify(title),
          description: faker.lorem.paragraphs({ min: 1, max: 4 }),
          boardId: randomBoard.id,
          postStatusId: randomPostStatus.id,
          userId: randomUserOnTenant.userId,
          tenantId: tenant.id,
          tags: [...new Set(Array.from({ length: faker.number.int(3) }, () => faker.git.branch()))],
          createdAt: randomPastDate,
          updatedAt: faker.date.soon({ refDate: randomPastDate }),
        },
      });

      // between 0 and 3 times, randomly update the post status with a status different from the one from the previous iteration of the loop

      let randomNewPostStatus = faker.helpers.arrayElement(postStatuses.filter(ps => ps.id !== randomPostStatus.id));
      let randomNewPostStatusDate = faker.date.soon({ refDate: randomPastDate });
      for (let j = 0; j < faker.number.int(3); j++) {
        await prisma.postStatusChange.create({
          data: {
            postId: post.id,
            postStatusId: randomNewPostStatus.id,
            tenantId: tenant.id,
            userId: randomUserOnTenant.userId,
            createdAt: randomNewPostStatusDate,
          },
        });
        randomNewPostStatus = faker.helpers.arrayElement(postStatuses.filter(ps => ps.id !== randomNewPostStatus.id));
        randomNewPostStatusDate = faker.date.soon({ refDate: randomNewPostStatusDate });
      }

      // pin first post per board
      if (!pinnedBoards.has(randomBoard.id)) {
        await prisma.pin.create({
          data: {
            boardId: randomBoard.id,
            postId: post.id,
          },
        });
        pinnedBoards.add(randomBoard.id);
      }

      await prisma.like.createMany({
        data: Array.from({ length: faker.number.int(MAX_LIKES) }, () => ({
          postId: post.id,
          anonymousId: faker.string.uuid(),
          tenantId: tenant.id,
        })) as Like[],
      });

      await prisma.comment.createMany({
        data: Array.from({ length: faker.number.int(MAX_COMMENTS) }, () => {
          const commentDate = faker.date.soon({ refDate: randomPastDate });
          const isPostUpdate = faker.datatype.boolean();
          return {
            body: faker.lorem.paragraph({ min: 1, max: 4 }),
            postId: post.id,
            userId: usersOnTenant[faker.number.int(usersOnTenant.length - 1)].userId,
            tenantId: tenant.id,
            createdAt: commentDate,
            ...(isPostUpdate
              ? {
                  updatedAt: faker.date.soon({ refDate: commentDate }),
                }
              : {}),
            isPostUpdate,
          } as Comment;
        }),
      });

      const parentComments = await prisma.comment.findMany({
        where: {
          postId: post.id,
          parentId: null,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          createdAt: true,
        },
      });
      await prisma.comment.createMany({
        data: parentComments
          .map(({ id, createdAt }) => {
            let replyDate = createdAt;
            const parentId = id;
            return Array.from({ length: faker.number.int(MAX_REPLIES) }, () => {
              const isPostUpdate = faker.datatype.boolean();
              replyDate = faker.date.soon({ refDate: replyDate });
              return {
                body: faker.lorem.paragraph({ min: 1, max: 4 }),
                postId: post.id,
                userId: faker.helpers.arrayElement(usersOnTenant).userId,
                tenantId: tenant.id,
                parentId,
                createdAt: replyDate,
                ...(isPostUpdate
                  ? {
                      updatedAt: faker.date.soon({ refDate: replyDate }),
                    }
                  : {}),
                isPostUpdate,
              } as Comment;
            });
          })
          .flat(),
      });

      const alreadyFollowed = [...usersOnTenant];
      await prisma.follow.createMany({
        data: Array.from({ length: faker.number.int(MAX_FOLLOWS) }, () => {
          const userIndex = faker.number.int(alreadyFollowed.length - 1);
          const userId = alreadyFollowed[userIndex].userId;
          alreadyFollowed.splice(userIndex, 1);
          return {
            postId: post.id,
            tenantId: tenant.id,
            userId,
          } as Follow;
        }),
      });
    }

    // test PostWithHotness
    const postsWithHotnessCount = await prisma.postWithHotness.count();
    if (postsWithHotnessCount !== POSTS_COUNT + previousPostCount) {
      throw new Error("PostWithHotness count is not correct");
    }
  }
}
