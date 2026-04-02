import { TimelineConnector, TimelineContent, TimelineDot, TimelineSeparator } from "@roadmaps-faciles/ui";
import { MessageCircle } from "lucide-react";

import { type UserRole } from "@/prisma/enums";

import { type CommentActivity } from "./activityHelpers";
import { CommentContent } from "./CommentContent";
import { ItemDate } from "./ItemDate";

interface CommentItemProps {
  activity: CommentActivity;
  isAdmin: boolean;
  postAuthorId?: string;
  roleMap: Record<string, UserRole>;
  userId?: string;
  userImage?: string;
  userName?: string;
}

export const CommentItem = ({
  activity,
  userId,
  userName,
  userImage,
  roleMap,
  postAuthorId,
  isAdmin,
}: CommentItemProps) => {
  return (
    <>
      <TimelineSeparator>
        <TimelineDot variant="outline" size="icon">
          <MessageCircle className="size-4" />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent className="flex flex-col">
        <ItemDate activity={activity} />
        <CommentContent
          activity={activity}
          userId={userId}
          userName={userName}
          userImage={userImage}
          roleMap={roleMap}
          postAuthorId={postAuthorId}
          isAdmin={isAdmin}
        />
      </TimelineContent>
    </>
  );
};
