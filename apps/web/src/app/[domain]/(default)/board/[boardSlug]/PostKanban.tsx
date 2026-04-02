"use client";

import { Badge } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { type PostStatus } from "@/prisma/client";
import { dirtySafePathname } from "@/utils/dirtyDomain/pathnameDirtyCheck";

import { type EnrichedPost } from "./actions";
import { type Order } from "./types";

export interface PostKanbanProps {
  allowAnonymousVoting?: boolean;
  allowVoting?: boolean;
  anonymousId: string;
  boardId: number;
  initialPosts: EnrichedPost[];
  order: Order;
  search?: string;
  statuses: PostStatus[];
  totalCount: number;
  userId?: string;
}

export const PostKanban = ({ initialPosts, statuses }: PostKanbanProps) => {
  const t = useTranslations("board");
  const pathname = usePathname();
  const dirtyDomainFixer = dirtySafePathname(pathname.split("/board")[0] ?? "");

  // Group posts by status
  const postsByStatus = new Map<null | number, EnrichedPost[]>();
  postsByStatus.set(null, []);
  for (const status of statuses) {
    postsByStatus.set(status.id, []);
  }
  for (const post of initialPosts) {
    const key = post.postStatusId;
    const list = postsByStatus.get(key) ?? [];
    list.push(post);
    postsByStatus.set(key, list);
  }

  const unclassified = postsByStatus.get(null) ?? [];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map(status => {
        const posts = postsByStatus.get(status.id) ?? [];
        return (
          <div key={status.id} className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-semibold">{status.name}</span>
              <Badge variant="secondary" className="text-xs">
                {posts.length}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 p-2">
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={dirtyDomainFixer(`/post/${post.id}`)}
                  className="rounded-md border bg-background p-3 text-sm shadow-sm transition-colors hover:bg-accent"
                >
                  <p className="font-medium leading-snug">{post.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post._count.likes} votes</span>
                    <span>
                      {post._count.comments} {t("comments")}
                    </span>
                  </div>
                </Link>
              ))}
              {posts.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-muted-foreground">{t("noPosts")}</p>
              )}
            </div>
          </div>
        );
      })}
      {unclassified.length > 0 && (
        <div className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-semibold text-muted-foreground">{t("unclassified")}</span>
            <Badge variant="secondary" className="text-xs">
              {unclassified.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-2 p-2">
            {unclassified.map(post => (
              <Link
                key={post.id}
                href={dirtyDomainFixer(`/post/${post.id}`)}
                className="rounded-md border bg-background p-3 text-sm shadow-sm transition-colors hover:bg-accent"
              >
                <p className="font-medium leading-snug">{post.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post._count.likes} votes</span>
                  <span>
                    {post._count.comments} {t("comments")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
