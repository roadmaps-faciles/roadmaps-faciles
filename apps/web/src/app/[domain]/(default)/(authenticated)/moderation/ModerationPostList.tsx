"use client";

import { cn } from "@roadmaps-faciles/ui";
import { Button } from "@roadmaps-faciles/ui/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@roadmaps-faciles/ui/components/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roadmaps-faciles/ui/components/table";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useTransition } from "react";
import { MarkdownHooks } from "react-markdown";

import { type Board, type Post, type User } from "@/prisma/client";
import { formatDateHour } from "@/utils/date";
import { reactMarkdownConfig } from "@/utils/react-markdown";

import { approvePost, deletePost, rejectPost } from "./actions";

type ModerationPost = { board: Board; user: null | User } & Post;

interface ModerationPostListProps {
  emptyMessage: string;
  posts: ModerationPost[];
  variant: "pending" | "rejected";
}

export const ModerationPostList = ({ posts, emptyMessage, variant }: ModerationPostListProps) => {
  const t = useTranslations("moderation");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [selectedPost, setSelectedPost] = useState<ModerationPost | null>(null);

  const handleApprove = (postId: number) => {
    startTransition(async () => {
      await approvePost({ postId });
    });
  };

  const handleReject = (postId: number) => {
    startTransition(async () => {
      await rejectPost({ postId });
    });
  };

  const handleDelete = (postId: number) => {
    if (!confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      await deletePost({ postId });
    });
  };

  if (posts.length === 0) {
    return <p className="text-lg text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("postTitle")}</TableHead>
            <TableHead>{t("description")}</TableHead>
            <TableHead>{t("board")}</TableHead>
            <TableHead>{t("author")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map(post => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                {post.description ? (
                  <Link
                    className={cn(
                      "line-clamp-2 text-sm text-primary rounded-sm outline-offset-8",
                      "outline-primary hover:outline-1",
                    )}
                    onClick={e => {
                      e.preventDefault();
                      setSelectedPost(post);
                    }}
                    href="#"
                  >
                    <MarkdownHooks {...reactMarkdownConfig}>{post.description}</MarkdownHooks>
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">{t("noDescription")}</span>
                )}
              </TableCell>
              <TableCell>{post.board.name}</TableCell>
              <TableCell>{post.user?.name ?? post.sourceLabel ?? t("anonymous")}</TableCell>
              <TableCell className="text-nowrap">{formatDateHour(post.createdAt, locale)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {variant === "pending" && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => handleApprove(post.id)} disabled={isPending}>
                        {t("approve")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleReject(post.id)} disabled={isPending}>
                        {t("reject")}
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)} disabled={isPending}>
                    <Trash2 className="mr-1 size-4" />
                    {t("delete")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedPost} onOpenChange={open => !open && setSelectedPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          {selectedPost?.description && (
            <div className="prose prose-sm max-w-none">
              <MarkdownHooks {...reactMarkdownConfig}>{selectedPost.description}</MarkdownHooks>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
