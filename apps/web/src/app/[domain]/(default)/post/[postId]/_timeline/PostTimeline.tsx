import { Timeline, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from "@roadmaps-faciles/ui";
import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/logger";
import { auth } from "@/lib/next-auth/auth";
import { type Activity } from "@/prisma/client";
import { type UserRole } from "@/prisma/enums";

import { type PostPageComponentProps } from "../PostPageHOP";
import { isAggregateActivity, isCommentActivity, isStatusChangeActivity } from "./activityHelpers";
import { AggregateItem } from "./AggregateItem";
import { CommentItem } from "./CommentItem";
import { ItemDate } from "./ItemDate";
import { StatusChangeItem } from "./StatusChangeItem";

export interface PostTimelineProps {
  isAdmin: boolean;
  post: PostPageComponentProps["post"];
}

export const PostTimeline = async ({ post, isAdmin }: PostTimelineProps) => {
  const t = await getTranslations("post");
  const session = await auth();
  const userId = session?.user?.uuid;
  const userName = session?.user?.name ?? undefined;
  const userImage = session?.user?.image ?? undefined;

  // Batch-fetch tenant roles for all comment/reply authors
  const commentUserIds = new Set<string>();
  for (const activity of post.activities) {
    if (isCommentActivity(activity)) {
      commentUserIds.add(activity.comment.userId);
      for (const reply of activity.comment.replies) {
        if (reply) commentUserIds.add(reply.userId);
      }
    }
  }

  const memberships =
    commentUserIds.size > 0
      ? await prisma.userOnTenant.findMany({
          where: { userId: { in: [...commentUserIds] }, tenantId: post.tenantId },
          select: { userId: true, role: true },
        })
      : [];

  const roleMap: Record<string, UserRole> = Object.fromEntries(memberships.map(m => [m.userId, m.role]));

  return (
    <Timeline>
      {post.activities.map(activity => (
        <TimelineItem key={`activity-${activity.id}`}>
          {isCommentActivity(activity) ? (
            <CommentItem
              activity={activity}
              userId={userId}
              userName={userName}
              userImage={userImage}
              roleMap={roleMap}
              postAuthorId={post.userId ?? undefined}
              isAdmin={isAdmin}
            />
          ) : isStatusChangeActivity(activity) ? (
            <StatusChangeItem activity={activity} />
          ) : isAggregateActivity(activity) ? (
            <AggregateItem activity={activity} />
          ) : (
            (logger.warn({ activityType: activity.type, activityId: activity.id }, "Unrecognized activity type"), null)
          )}
        </TimelineItem>
      ))}
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot variant="success" size="icon">
            <Star className="size-4" />
          </TimelineDot>
        </TimelineSeparator>

        <TimelineContent className="flex flex-col gap-2">
          <ItemDate activity={{ id: post.id, startTime: post.createdAt } as Activity} />
          {t("postCreated", { author: post.user?.name ?? post.sourceLabel ?? t("anonymous") })}
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
};
