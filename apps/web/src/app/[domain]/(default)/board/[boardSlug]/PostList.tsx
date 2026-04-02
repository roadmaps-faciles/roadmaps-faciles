"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import { BoardPost } from "@/components/Board/Post";
import { Loader } from "@/components/utils/Loader";
import { UIButton, UISeparator } from "@/ui/bridge";
import { dirtySafePathname } from "@/utils/dirtyDomain/pathnameDirtyCheck";

import { type EnrichedPost, fetchPostsForBoard } from "./actions";
import { type Order } from "./types";

const MARKER = "-------";
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface PostListProps {
  allowAnonymousVoting?: boolean;
  allowVoting?: boolean;
  anonymousId: string;
  boardId: number;
  boardSlug: string;
  initialPosts: EnrichedPost[];
  linkTarget?: string;
  order: Order;
  search?: string;
  totalCount: number;
  userId?: string;
}

export const PostList = ({
  allowAnonymousVoting,
  allowVoting,
  initialPosts,
  totalCount,
  userId,
  anonymousId,
  order,
  boardId,
  search,
  boardSlug,
  linkTarget,
}: PostListProps) => {
  const [posts, setPosts] = useState<EnrichedPost[]>(initialPosts);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const pathname = usePathname();
  const dirtyDomainFixer = dirtySafePathname(pathname);
  const t = useTranslations("common");

  const handleLoadMore = () => {
    startTransition(async () => {
      const nextPage = page + 1;
      const { posts: newPosts } = await fetchPostsForBoard(nextPage, order, boardId, search);
      setPosts(prevPosts => [...prevPosts, ...(newPosts as EnrichedPost[])]);
      setPage(nextPage);
    });
  };

  return (
    <>
      {posts.map((post, index) => {
        const alreadyLiked = post.likes.some(like => userId === like.userId || like.anonymousId === anonymousId);
        const title = search
          ? post.title
              .replace(new RegExp(escapeRegExp(search), "gi"), match => `${MARKER}${match}${MARKER}`)
              .split(MARKER)
              .filter(Boolean)
              .filter(item => item !== MARKER)
              .map((item, index) => {
                const isMatch = item.toLocaleLowerCase() === search?.toLocaleLowerCase();
                return isMatch ? <mark key={index}>{item}</mark> : item;
              })
          : post.title;
        const description = search
          ? post.description?.replace(new RegExp(escapeRegExp(search), "gi"), match => `\n::search-mark[${match}]{}\n`)
          : post.description;
        return (
          <BoardPost
            key={`post_${post.id}`}
            first={index === 0}
            post={{
              ...post,
              title: title as string,
              description: description || null,
            }}
            alreadyLiked={alreadyLiked}
            allowAnonymousVoting={allowAnonymousVoting}
            allowVoting={allowVoting}
            userId={userId}
            boardSlug={boardSlug}
            dirtyDomainFixer={dirtyDomainFixer}
            linkTarget={linkTarget}
          />
        );
      })}
      <div className="flex items-center gap-4 py-4">
        <UISeparator className="flex-1" />
        {isPending ? (
          <Loader loading />
        ) : (
          <UIButton variant="ghost" type="button" onClick={handleLoadMore} disabled={totalCount === posts.length}>
            {t("more")}
          </UIButton>
        )}
        <UISeparator className="flex-1" />
      </div>
    </>
  );
};
