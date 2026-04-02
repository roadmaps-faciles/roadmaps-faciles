"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { type PostStatus } from "@/prisma/client";
import { dirtySafePathname } from "@/utils/dirtyDomain/pathnameDirtyCheck";

import { type EnrichedPost } from "./actions";
import { type Order } from "./types";

export interface PostKanbanAccordionProps {
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

export const PostKanbanAccordion = ({ initialPosts, statuses }: PostKanbanAccordionProps) => {
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
  const allValues = [...statuses.map(s => `status-${s.id}`), ...(unclassified.length > 0 ? ["unclassified"] : [])];

  return (
    <Accordion type="multiple" defaultValue={allValues} className="space-y-2">
      {statuses.map(status => {
        const posts = postsByStatus.get(status.id) ?? [];
        return (
          <AccordionItem key={status.id} value={`status-${status.id}`} className="rounded-lg border">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{status.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {posts.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              {posts.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">{t("noPosts")}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {posts.map(post => (
                    <Link
                      key={post.id}
                      href={dirtyDomainFixer(`/post/${post.id}`)}
                      className="flex items-center justify-between rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                    >
                      <p className="text-sm font-medium">{post.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{post._count.likes} votes</span>
                        <span>
                          {post._count.comments} {t("comments")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
      {unclassified.length > 0 && (
        <AccordionItem value="unclassified" className="rounded-lg border">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">{t("unclassified")}</span>
              <Badge variant="secondary" className="text-xs">
                {unclassified.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="flex flex-col gap-2">
              {unclassified.map(post => (
                <Link
                  key={post.id}
                  href={dirtyDomainFixer(`/post/${post.id}`)}
                  className="flex items-center justify-between rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                >
                  <p className="text-sm font-medium">{post.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{post._count.likes} votes</span>
                    <span>
                      {post._count.comments} {t("comments")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
};
