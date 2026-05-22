"use client";

import { Progress } from "@roadmaps-faciles/ui/components/progress";
import { cn } from "@roadmaps-faciles/ui/lib/cn";
import { Check, MessageSquare } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";

import { LikeButton } from "@/components/Board/LikeButton";
import { type PostStatusColor } from "@/lib/model/PostStatus";
import { getTone, ROADMAP_TONE_CLASSES } from "@/lib/utils/postStatusTone";
import { UITag } from "@/ui/bridge";

export interface RoadmapPostCardData {
  alreadyLiked: boolean;
  boardName: string;
  commentsCount: number;
  createdAt: Date;
  description: null | string;
  eta: null | string;
  id: number;
  likesCount: number;
  postStatusId: null | number;
  postUrl: string;
  progress: null | number;
  shippedAt: Date | null;
  statusColor: null | PostStatusColor;
  tags: string[];
  title: string;
}

interface RoadmapPostCardProps {
  dense?: boolean;
  post: RoadmapPostCardData;
  showVotes: boolean;
  tenantId: number;
  userId?: string;
}

export const RoadmapPostCard = ({ post, showVotes, tenantId, userId, dense }: RoadmapPostCardProps) => {
  const t = useTranslations("roadmap.card");
  const format = useFormatter();
  const tone = getTone(post.statusColor);
  const cardBorder = ROADMAP_TONE_CLASSES[tone].cardBorder;

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-2 rounded-xl border bg-card p-4 hover:border-border transition-colors",
        cardBorder,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          {post.tags.slice(0, 3).map(tag => (
            <UITag key={tag} as="span" size="sm">
              {tag}
            </UITag>
          ))}
          {post.tags.length === 0 && (
            <UITag as="span" size="sm">
              {post.boardName}
            </UITag>
          )}
        </div>
        {showVotes && (
          <LikeButton postId={post.id} tenantId={tenantId} size="sm" userId={userId} alreadyLiked={post.alreadyLiked}>
            {post.likesCount}
          </LikeButton>
        )}
      </div>

      <Link href={post.postUrl} className="no-underline focus-visible:outline-none">
        <h3 className="text-base/snug font-semibold tracking-tight text-foreground hover:text-primary">{post.title}</h3>
      </Link>

      {!dense && post.description && (
        <p className="text-sm/snug text-muted-foreground line-clamp-2">{post.description}</p>
      )}

      {post.progress != null && (
        <div className="mt-1 flex items-center gap-3" aria-label={t("progressLabel")}>
          <Progress value={post.progress} className="h-1.5" />
          <span className="shrink-0 text-xs tabular-nums font-medium text-muted-foreground">{post.progress}%</span>
        </div>
      )}

      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        {post.shippedAt && (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
            <span className="grid place-items-center size-3.5 rounded-full bg-emerald-500/15">
              <Check className="size-2.5" aria-hidden="true" />
            </span>
            {t("shipped", { date: format.dateTime(post.shippedAt, { month: "long", year: "numeric" }) })}
          </span>
        )}
        {!post.shippedAt && post.eta && (
          <span className="inline-flex items-center gap-1">{t("eta", { eta: post.eta })}</span>
        )}
        {post.commentsCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3" aria-hidden="true" />
            {post.commentsCount}
          </span>
        )}
      </div>
    </article>
  );
};
