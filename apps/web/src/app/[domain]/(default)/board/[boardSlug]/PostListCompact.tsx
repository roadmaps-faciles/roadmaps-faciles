"use client";

import { cn } from "@roadmaps-faciles/ui";
import { MessageSquare } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

import { LikeButton } from "@/components/Board/LikeButton";
import { RemoteStatsBadge } from "@/components/Board/RemoteStatsBadge";
import { Loader } from "@/components/utils/Loader";
import { useUI } from "@/ui";
import { UIBadge, UIButton, UISeparator, UITag } from "@/ui/bridge";
import { formatRelativeDate } from "@/utils/date";
import { dirtySafePathname } from "@/utils/dirtyDomain/pathnameDirtyCheck";

import { type EnrichedPost, fetchPostsForBoard } from "./actions";
import style from "./Board.module.scss";
import { type Order } from "./types";

const MARKER = "-------";

export interface PostListCompactProps {
  allowAnonymousVoting?: boolean;
  allowVoting?: boolean;
  anonymousId: string;
  boardId: number;
  initialPosts: EnrichedPost[];
  linkTarget?: string;
  order: Order;
  search?: string;
  totalCount: number;
  userId?: string;
}

export const PostListCompact = ({
  allowAnonymousVoting,
  allowVoting,
  initialPosts,
  totalCount,
  userId,
  anonymousId,
  order,
  boardId,
  search,
  linkTarget,
}: PostListCompactProps) => {
  const [posts, setPosts] = useState<EnrichedPost[]>(initialPosts);
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const pathname = usePathname();
  const dirtyDomainFixer = dirtySafePathname(pathname);
  const t = useTranslations();
  const locale = useLocale();
  const isDsfr = useUI() === "Dsfr";

  const handleLoadMore = () => {
    startTransition(async () => {
      const nextPage = page + 1;
      const { posts: newPosts } = await fetchPostsForBoard(nextPage, order, boardId, search);
      setPosts(prevPosts => [...prevPosts, ...(newPosts as EnrichedPost[])]);
      setPage(nextPage);
    });
  };

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightTitle = (title: string) => {
    if (!search) return title;
    return title
      .replace(new RegExp(escapeRegExp(search), "gi"), match => `${MARKER}${match}${MARKER}`)
      .split(MARKER)
      .filter(Boolean)
      .filter(item => item !== MARKER)
      .map((item, index) => {
        const isMatch = item.toLocaleLowerCase() === search.toLocaleLowerCase();
        return isMatch ? <mark key={index}>{item}</mark> : item;
      });
  };

  return (
    <>
      <ul className={isDsfr ? style.compactList : "list-none p-0 m-0 border border-border rounded-md overflow-hidden"}>
        {posts.map(post => {
          const alreadyLiked = post.likes.some(like => userId === like.userId || like.anonymousId === anonymousId);

          return (
            <li
              key={`post_compact_${post.id}`}
              className={
                isDsfr
                  ? style.compactItem
                  : "px-4 py-3 border-b border-border last:border-b-0 transition-colors hover:bg-muted/50"
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                {allowVoting && (allowAnonymousVoting || userId) && (
                  <div className="shrink-0">
                    <LikeButton
                      alreadyLiked={alreadyLiked}
                      postId={post.id}
                      tenantId={post.tenantId}
                      userId={userId}
                      size="sm"
                    >
                      {post._count.likes}
                    </LikeButton>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.postStatus ? (
                      <UIBadge size="sm" statusColor={post.postStatus.color}>
                        {post.postStatus.name}
                      </UIBadge>
                    ) : (
                      <UIBadge size="sm" statusColor="grey">
                        {t("post.unclassified")}
                      </UIBadge>
                    )}
                    <Link
                      href={dirtyDomainFixer(`/post/${post.id}`)}
                      className="truncate text-primary underline-offset-4 hover:underline"
                      {...(linkTarget && { target: linkTarget })}
                    >
                      {highlightTitle(post.title)}
                    </Link>
                  </div>
                  <div className={cn("mt-1 text-xs flex items-center gap-2 flex-wrap text-muted-foreground")}>
                    <span>{post.user?.name ?? post.sourceLabel ?? t("board.anonymous")}</span>
                    <span>·</span>
                    <span>{formatRelativeDate(new Date(post.createdAt), locale)}</span>
                    {post.editedAt && (
                      <>
                        <span>·</span>
                        <span>{t("board.edited")}</span>
                      </>
                    )}
                    {post.remoteMappings && post.remoteMappings.length > 0 && (
                      <>
                        <span>·</span>
                        <RemoteStatsBadge mappings={post.remoteMappings} />
                      </>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <>
                        <span>·</span>
                        {post.tags.map(tag => (
                          <UITag as="span" key={tag} size="sm">
                            {tag}
                          </UITag>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3 text-muted-foreground">
                  {post._count.comments > 0 && (
                    <span className="text-sm flex items-center gap-1">
                      <MessageSquare className="size-4" />
                      {post._count.comments}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center gap-4 py-4">
        <UISeparator className="flex-1" />
        {isPending ? (
          <Loader loading />
        ) : (
          <UIButton variant="ghost" type="button" onClick={handleLoadMore} disabled={totalCount === posts.length}>
            {t("common.more")}
          </UIButton>
        )}
        <UISeparator className="flex-1" />
      </div>
    </>
  );
};
