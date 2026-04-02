import { type Activity, type Comment, type PostStatus, type PostStatusChange, type User } from "@/prisma/client";
import { type ClearObject } from "@/utils/types";

export type CommentActivity = ClearObject<
  {
    comment: {
      _count: {
        replies: number;
      };
      replies: [
        firstComment?: {
          user: User;
        } & Comment,
      ];
      user: User;
    } & Comment;
    commentId: number;
    statusChangeId: null;
    type: "COMMENT";
  } & Activity
>;

export type StatusChangeActivity = ClearObject<
  {
    commentId: null;
    statusChange: {
      postStatus: PostStatus;
    } & PostStatusChange;
    type: "STATUS_CHANGE";
  } & Activity
>;

export type AggregateActivity = ClearObject<
  {
    commentId: null;
    statusChangeId: null;
    type: "COMMENT_COUNT" | "FOLLOW" | "LIKE";
  } & Activity
>;

export type EnrichedActivity = AggregateActivity | CommentActivity | StatusChangeActivity;

export function isCommentActivity(activity: Activity): activity is CommentActivity {
  return activity.type === "COMMENT" && "comment" in activity && activity.comment !== null;
}

export function isStatusChangeActivity(activity: Activity): activity is StatusChangeActivity {
  return activity.type === "STATUS_CHANGE" && "statusChange" in activity && activity.statusChange !== null;
}
export function isAggregateActivity(activity: Activity): activity is AggregateActivity {
  return activity.type === "LIKE" || activity.type === "FOLLOW";
}
