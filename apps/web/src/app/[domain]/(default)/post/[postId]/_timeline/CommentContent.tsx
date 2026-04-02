"use client";

import Avatar from "@mui/material/Avatar";
import { cn } from "@roadmaps-faciles/ui";
import * as Sentry from "@sentry/nextjs";
import { Pencil, Reply as ReplyIcon, Send, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  type PropsWithChildren,
  startTransition,
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { MarkdownHooks } from "react-markdown";

import { getMaterialAvatarProps } from "@/components/img/InitialsAvatar";
import { Loader } from "@/components/utils/Loader";
import { type Comment, type User } from "@/prisma/client";
import { UserRole } from "@/prisma/enums";
import { UIAlert, UIBadge, UIButton, UICard, UIMarkdownEditor, UITag } from "@/ui/bridge";
import { formatDateHour } from "@/utils/date";
import { reactMarkdownConfig } from "@/utils/react-markdown";

import { uploadImage } from "../../../upload-image";
import { deleteComment, editComment, getReplies, sendComment } from "./actions";
import { type CommentActivity } from "./activityHelpers";
import style from "./CommentContent.module.scss";

type ReplyWithUser = { user: User } & Comment;

const ELEVATED_ROLES: Partial<Record<UserRole, "info" | "new" | "warning">> = {
  [UserRole.OWNER]: "warning",
  [UserRole.ADMIN]: "info",
  [UserRole.MODERATOR]: "new",
};

const ROLE_LABEL_KEYS: Partial<Record<UserRole, string>> = {
  [UserRole.OWNER]: "roleOwner",
  [UserRole.ADMIN]: "roleAdmin",
  [UserRole.MODERATOR]: "roleModerator",
};

const SEVERITY_TO_VARIANT = {
  info: "default",
  new: "secondary",
  warning: "warning",
} as const;

const AuthorBadges = ({
  authorUserId,
  currentUserId,
  postAuthorId,
  roleMap,
  t,
}: {
  authorUserId: string;
  currentUserId?: string;
  postAuthorId?: string;
  roleMap: Record<string, UserRole>;
  t: ReturnType<typeof useTranslations<"post">>;
}) => {
  const role = roleMap[authorUserId];
  const severity = role ? ELEVATED_ROLES[role] : undefined;
  const labelKey = role ? ROLE_LABEL_KEYS[role] : undefined;
  const isMe = currentUserId === authorUserId;
  const isPostAuthor = postAuthorId === authorUserId;

  if (!severity && !isMe && !isPostAuthor) return null;

  return (
    <span className="flex items-center gap-1 flex-wrap">
      {severity && labelKey && (
        <UIBadge variant={SEVERITY_TO_VARIANT[severity]}>{t(labelKey as Parameters<typeof t>[0])}</UIBadge>
      )}
      {isPostAuthor && <UITag size="sm">{t("tagAuthor")}</UITag>}
      {isMe && <UITag size="sm">{t("tagYou")}</UITag>}
    </span>
  );
};

interface CommentContentProps {
  activity: CommentActivity;
  isAdmin: boolean;
  postAuthorId?: string;
  roleMap: Record<string, UserRole>;
  userId?: string;
  userImage?: string;
  userName?: string;
}

export const CommentContent = ({
  activity,
  userId,
  userName,
  userImage,
  roleMap: initialRoleMap,
  postAuthorId,
  isAdmin,
}: CommentContentProps) => {
  const t = useTranslations("post");
  const locale = useLocale();
  const comment = activity.comment;
  const [showInput, setShowInput] = useState(false);
  const [replies, setReplies] = useState(comment.replies as ReplyWithUser[]);
  const [showReplies, setShowReplies] = useState(false);
  const [firstOpen, setFirstOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [roleMap, setRoleMap] = useState(initialRoleMap);

  // Edit state for the main comment
  const [isEditing, setIsEditing] = useState(false);
  const [commentBody, setCommentBody] = useState(comment.body);
  const [wasEdited, setWasEdited] = useState(comment.updatedAt > comment.createdAt);
  const editBodyRef = useRef(comment.body ?? "");
  const [editKey, setEditKey] = useState(0);
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState<null | string>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  // Optimistic replies
  const [optimisticReplies, addOptimisticReply] = useOptimistic(replies, (currentReplies, newReply: ReplyWithUser) => [
    ...currentReplies,
    newReply,
  ]);

  // Reply form state
  const replyBodyRef = useRef("");
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, startReplyTransition] = useTransition();
  const [replyError, setReplyError] = useState<null | string>(null);

  // Scroll to reply input when opened
  const replyInputRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showInput && replyInputRef.current) {
      replyInputRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [showInput]);

  const handleReplyChange = useCallback((value: string) => {
    replyBodyRef.current = value;
  }, []);

  const handleEditChange = useCallback((value: string) => {
    editBodyRef.current = value;
  }, []);

  const canEditComment = userId === comment.userId;
  const canDeleteComment = userId === comment.userId || isAdmin;

  const handleEditSave = async () => {
    const body = editBodyRef.current.trim();
    if (!body) return;
    setEditPending(true);
    setEditError(null);
    const result = await editComment({ commentId: comment.id, body });
    if (result.ok) {
      setCommentBody(body);
      setWasEdited(true);
      setIsEditing(false);
      setEditKey(k => k + 1);
    } else {
      setEditError(result.error);
    }
    setEditPending(false);
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteCommentConfirm"))) return;
    const result = await deleteComment(comment.id);
    if (result.ok) {
      setIsDeleted(true);
    }
  };

  const handleReplyEdit = (replyId: number, newBody: string) => {
    setReplies(prev => prev.map(r => (r.id === replyId ? { ...r, body: newBody, updatedAt: new Date() } : r)));
  };

  const handleReplyDelete = (replyId: number) => {
    setReplies(prev => prev.filter(r => r.id !== replyId));
  };

  const handleReplySubmit = () => {
    const body = replyBodyRef.current.trim();
    if (!body || !userId) return;

    setReplyError(null);

    const optimisticReply = {
      body,
      createdAt: new Date(),
      id: -Date.now(),
      isPostUpdate: false,
      parentId: comment.id,
      postId: comment.postId,
      tenantId: comment.tenantId,
      updatedAt: new Date(),
      user: { id: userId, image: userImage ?? null, name: userName ?? null } as User,
      userId,
    } satisfies ReplyWithUser;

    startReplyTransition(async () => {
      addOptimisticReply(optimisticReply);
      const result = await sendComment({
        body,
        parentId: comment.id,
        postId: comment.postId,
        tenantId: comment.tenantId,
      });

      if (result.ok) {
        // If replies weren't fully loaded yet, fetch them all now
        if (firstOpen) {
          const fullReplies = await getReplies(comment.id);
          if (fullReplies.ok) {
            setReplies(fullReplies.data.replies);
            setRoleMap(prev => ({ ...prev, ...fullReplies.data.roleMap }));
          } else {
            const realReply = result.data as unknown as ReplyWithUser;
            setReplies(prev => [...prev, realReply]);
          }
        } else {
          const realReply = result.data as unknown as ReplyWithUser;
          setReplies(prev => [...prev, realReply]);
        }
        replyBodyRef.current = "";
        setEditorKey(k => k + 1);
        setShowInput(false);
        setShowReplies(true);
        setFirstOpen(false);
      } else {
        setReplyError(result.error);
      }
    });
  };

  const handleFirstOpen = () => {
    if (loading) return;
    setLoading(true);
    startTransition(async () => {
      try {
        const response = await getReplies(comment.id);
        if (response.ok) {
          setReplies(response.data.replies);
          setRoleMap(prev => ({ ...prev, ...response.data.roleMap }));
          setFirstOpen(false);
          setShowReplies(true);
        } else {
          Sentry.captureMessage(`Failed to fetch replies: ${response.error}`, "error");
        }
      } catch (error) {
        Sentry.captureException(error);
      }
      setLoading(false);
    });
  };

  if (isDeleted) return null;

  const hasMoreReplies = comment._count.replies > 1;
  const firstReply = optimisticReplies[0];
  const displayReplies = optimisticReplies;

  const badgeProps = { currentUserId: userId, postAuthorId, roleMap, t };

  return (
    <>
      <UICard
        shadow
        className="[&]:p-0"
        size="default"
        horizontal
        title={
          <div className="flex justify-between items-center gap-4" data-comment-id={activity.comment.id}>
            <div className="flex items-center gap-2">
              <Avatar
                {...getMaterialAvatarProps(activity.comment.user.name ?? t("anonymous"))}
                alt={`Avatar ${activity.comment.user.name ?? t("anonymous")}`}
                src={activity.comment.user.image ?? undefined}
              />
              <span className="text-sm font-bold text-nowrap">{activity.comment.user.name}</span>
              <AuthorBadges authorUserId={activity.comment.userId} {...badgeProps} />
              {wasEdited && <span className="text-xs font-light">{t("edited")}</span>}
            </div>
            {(canEditComment || canDeleteComment) && !isEditing && (
              <span className="flex gap-1">
                {canEditComment && (
                  <UIButton
                    type="button"
                    size="icon"
                    variant="ghost"
                    title={t("editComment")}
                    onClick={() => {
                      editBodyRef.current = commentBody ?? "";
                      setIsEditing(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </UIButton>
                )}
                {canDeleteComment && (
                  <UIButton
                    type="button"
                    size="icon"
                    variant="ghost"
                    title={t("deleteComment")}
                    onClick={() => void handleDelete()}
                  >
                    <Trash2 className="size-4" />
                  </UIButton>
                )}
              </span>
            )}
          </div>
        }
        description={
          isEditing ? (
            <>
              <UIMarkdownEditor
                key={editKey}
                defaultValue={commentBody ?? ""}
                onChangeAction={handleEditChange}
                uploadImageAction={uploadImage}
                disabled={editPending}
              />
              {editError && <UIAlert variant="destructive" description={editError} className="mt-2" />}
              <div className="mt-2 flex justify-end gap-2">
                <UIButton
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={editPending}
                  onClick={() => setIsEditing(false)}
                >
                  {t("cancelEdit")}
                </UIButton>
                <UIButton type="button" size="sm" disabled={editPending} onClick={() => void handleEditSave()}>
                  {t("saveComment")}
                </UIButton>
              </div>
            </>
          ) : (
            <MarkdownHooks {...reactMarkdownConfig}>{commentBody}</MarkdownHooks>
          )
        }
        footer={
          <span className="flex justify-between items-center gap-4 w-full">
            <span className="flex items-center gap-2">
              <span className="text-xs font-light">{formatDateHour(activity.comment.createdAt, locale)}</span>
              {activity.comment._count.replies > 0 && (
                <span className="text-xs">{`${activity.comment._count.replies} réponse(s)`}</span>
              )}
            </span>
            <UIButton
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowInput(!showInput)}
              className={cn(showInput && "invisible")}
            >
              <ReplyIcon className="mr-1 size-4" />
              {t("reply")}
            </UIButton>
          </span>
        }
      />

      {(displayReplies.length > 0 || showInput) && (
        <div className={cn("mb-4", style.thread)}>
          {displayReplies.length > 0 &&
            (firstOpen ? (
              <ThreadEntity>
                {hasMoreReplies && (
                  <Loader
                    className="mb-4"
                    loading={loading}
                    text={
                      <UIButton size="sm" variant="ghost" type="button" onClick={handleFirstOpen}>
                        {t("viewPreviousReplies")}
                      </UIButton>
                    }
                  ></Loader>
                )}
                <ReplyCard
                  reply={firstReply}
                  isAdmin={isAdmin}
                  onEditAction={handleReplyEdit}
                  onDeleteAction={handleReplyDelete}
                  {...badgeProps}
                />
              </ThreadEntity>
            ) : showReplies ? (
              <>
                {displayReplies.map(reply => (
                  <ThreadEntity key={reply.id}>
                    <ReplyCard
                      reply={reply}
                      isAdmin={isAdmin}
                      onEditAction={handleReplyEdit}
                      onDeleteAction={handleReplyDelete}
                      {...badgeProps}
                    />
                  </ThreadEntity>
                ))}
                <ThreadEntity actions>
                  <div className="flex items-center justify-between">
                    <UIButton
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setShowReplies(false);
                        document
                          .querySelector(`[data-comment-id="${comment.id}"]`)
                          ?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                    >
                      {t("collapseReplies")}
                    </UIButton>
                    <UIButton
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowInput(!showInput)}
                      className={cn(showInput && "invisible")}
                    >
                      <ReplyIcon className="mr-1 size-4" />
                      {t("reply")}
                    </UIButton>
                  </div>
                </ThreadEntity>
              </>
            ) : (
              <ThreadEntity actions>
                <UIButton size="sm" variant="ghost" type="button" onClick={() => setShowReplies(true)}>
                  {t("viewReplies", { count: displayReplies.length })}
                </UIButton>
              </ThreadEntity>
            ))}
          {showInput && (
            <ThreadEntity>
              <div ref={replyInputRef}>
                {!userId ? (
                  <UIAlert
                    className="pb-2"
                    variant="default"
                    description={
                      <>
                        {t.rich("loginToComment", {
                          link: chunks => <Link href="/login">{chunks}</Link>,
                        })}
                      </>
                    }
                  />
                ) : (
                  <>
                    <UIMarkdownEditor
                      key={editorKey}
                      label={t("reply")}
                      onChangeAction={handleReplyChange}
                      uploadImageAction={uploadImage}
                      disabled={isPending}
                    />
                    {replyError && <UIAlert variant="destructive" description={replyError} className="mt-2" />}
                    <div className="mt-2 flex justify-end gap-2">
                      <UIButton
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => setShowInput(false)}
                      >
                        {t("cancelReply")}
                      </UIButton>
                      <UIButton type="button" size="sm" disabled={isPending} onClick={handleReplySubmit}>
                        <Send className="mr-1 size-4" />
                        {t("submitReply")}
                      </UIButton>
                    </div>
                  </>
                )}
              </div>
            </ThreadEntity>
          )}
        </div>
      )}
    </>
  );
};

export const ThreadEntity = ({
  children,
  id,
  row,
  actions,
}: PropsWithChildren<{ actions?: boolean; id?: string; row?: boolean }>) => (
  <div className={style["thread-entity"]} id={id}>
    <div className={style["threadline"]}>
      <div aria-hidden className={style["threadline-line"]}></div>
      <div aria-hidden className={style["threadline-end"]}></div>
    </div>
    <div
      className={cn(
        actions ? style["thread-entity-actions"] : style["thread-entity-content"],
        row && style["thread-entity--row"],
      )}
    >
      {children}
    </div>
  </div>
);

interface ReplyProps {
  currentUserId?: string;
  isAdmin: boolean;
  onDeleteAction: (replyId: number) => void;
  onEditAction: (replyId: number, newBody: string) => void;
  postAuthorId?: string;
  reply: ReplyWithUser;
  roleMap: Record<string, UserRole>;
  t: ReturnType<typeof useTranslations<"post">>;
}

const ReplyCard = ({
  reply,
  roleMap,
  currentUserId,
  postAuthorId,
  isAdmin,
  onEditAction,
  onDeleteAction,
  t,
}: ReplyProps) => {
  const locale = useLocale();
  const [isEditing, setIsEditing] = useState(false);
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState<null | string>(null);
  const editBodyRef = useRef(reply.body ?? "");
  const [editKey, setEditKey] = useState(0);

  const canEdit = currentUserId === reply.userId;
  const canDelete = currentUserId === reply.userId || isAdmin;
  const wasEdited = reply.updatedAt > reply.createdAt;

  const handleEditChange = useCallback((value: string) => {
    editBodyRef.current = value;
  }, []);

  const handleEditSave = async () => {
    const body = editBodyRef.current.trim();
    if (!body) return;
    setEditPending(true);
    setEditError(null);
    const result = await editComment({ commentId: reply.id, body });
    if (result.ok) {
      onEditAction(reply.id, body);
      setIsEditing(false);
      setEditKey(k => k + 1);
    } else {
      setEditError(result.error);
    }
    setEditPending(false);
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteCommentConfirm"))) return;
    const result = await deleteComment(reply.id);
    if (result.ok) {
      onDeleteAction(reply.id);
    }
  };

  return (
    <UICard
      shadow
      size="sm"
      horizontal
      title={
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              {...getMaterialAvatarProps(reply.user.name ?? t("anonymous"))}
              alt={`Avatar ${reply.user.name ?? t("anonymous")}`}
              src={reply.user.image ?? undefined}
            />
            <span className="text-sm font-bold text-nowrap">{reply.user.name}</span>
            <AuthorBadges
              authorUserId={reply.userId}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              roleMap={roleMap}
              t={t}
            />
            {wasEdited && <span className="text-xs font-light">{t("edited")}</span>}
            <span className="text-xs font-light text-nowrap">{formatDateHour(reply.createdAt, locale)}</span>
          </div>
          {(canEdit || canDelete) && !isEditing && (
            <span className="flex gap-1">
              {canEdit && (
                <UIButton
                  type="button"
                  size="icon"
                  variant="ghost"
                  title={t("editComment")}
                  onClick={() => {
                    editBodyRef.current = reply.body ?? "";
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="size-4" />
                </UIButton>
              )}
              {canDelete && (
                <UIButton
                  type="button"
                  size="icon"
                  variant="ghost"
                  title={t("deleteComment")}
                  onClick={() => void handleDelete()}
                >
                  <Trash2 className="size-4" />
                </UIButton>
              )}
            </span>
          )}
        </div>
      }
      description={
        isEditing ? (
          <>
            <UIMarkdownEditor
              key={editKey}
              defaultValue={reply.body ?? ""}
              onChangeAction={handleEditChange}
              uploadImageAction={uploadImage}
              disabled={editPending}
            />
            {editError && <UIAlert variant="destructive" description={editError} className="mt-2" />}
            <div className="mt-2 flex justify-end gap-2">
              <UIButton
                type="button"
                size="sm"
                variant="secondary"
                disabled={editPending}
                onClick={() => setIsEditing(false)}
              >
                {t("cancelEdit")}
              </UIButton>
              <UIButton type="button" size="sm" disabled={editPending} onClick={() => void handleEditSave()}>
                {t("saveComment")}
              </UIButton>
            </div>
          </>
        ) : (
          <MarkdownHooks {...reactMarkdownConfig}>{reply.body}</MarkdownHooks>
        )
      }
    />
  );
};

// Keep the old name as alias for backward compatibility in tests/imports
export { ReplyCard as Reply };
