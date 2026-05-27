"use client";

import { lazy, Suspense } from "react";

import { type PostStatusColor } from "@/lib/model/PostStatus";
import { useUI } from "@/ui";

import { RoadmapPostCardDefault } from "./RoadmapPostCardDefault";

const RoadmapPostCardDsfr = lazy(() => import("./RoadmapPostCardDsfr").then(m => ({ default: m.RoadmapPostCardDsfr })));

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
  statusName: null | string;
  tags: string[];
  title: string;
}

export interface RoadmapPostCardProps {
  dense?: boolean;
  post: RoadmapPostCardData;
  showVotes: boolean;
  tenantId: number;
  userId?: string;
}

export const RoadmapPostCard = (props: RoadmapPostCardProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense fallback={<RoadmapPostCardDefault {...props} />}>
        <RoadmapPostCardDsfr {...props} />
      </Suspense>
    );
  }

  return <RoadmapPostCardDefault {...props} />;
};
