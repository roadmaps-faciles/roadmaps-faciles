"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { type PropsWithChildren, useState, useTransition } from "react";

import { UIButton } from "@/ui/bridge";

import { deletePost } from "./actions";
import { PostEditForm } from "./PostEditForm";

interface PostEditToggleProps {
  boardSlug: string;
  canDelete: boolean;
  canEdit: boolean;
  description: null | string;
  isModal?: boolean;
  postId: number;
  title: string;
}

export const PostEditToggle = ({
  canEdit,
  canDelete,
  boardSlug,
  isModal,
  postId,
  title,
  description,
  children,
}: PropsWithChildren<PostEditToggleProps>) => {
  const [editing, setEditing] = useState(false);
  const [deleting, startDeleteTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("post");
  const tc = useTranslations("common");

  const handleDelete = () => {
    if (!confirm(t("deleteConfirm"))) return;
    startDeleteTransition(async () => {
      const result = await deletePost({ postId });
      if (result.ok) {
        if (isModal) {
          router.back();
        } else {
          router.push(boardSlug ? `/board/${boardSlug}` : "/");
        }
      } else {
        alert(result.error);
      }
    });
  };

  if (editing) {
    return (
      <PostEditForm
        postId={postId}
        title={title}
        description={description}
        onCancel={() => setEditing(false)}
        onSuccess={() => {
          setEditing(false);
          router.refresh();
        }}
      />
    );
  }

  return (
    <>
      {children}
      <span className="flex gap-2">
        {canEdit && (
          <UIButton variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="mr-1 size-4" />
            {tc("edit")}
          </UIButton>
        )}
        {canDelete && (
          <UIButton variant="outline" size="sm" disabled={deleting} onClick={handleDelete}>
            <Trash2 className="mr-1 size-4" />
            {t("deletePost")}
          </UIButton>
        )}
      </span>
    </>
  );
};
