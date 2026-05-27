"use client";

import { Button } from "@roadmaps-faciles/ui/components/button";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@roadmaps-faciles/ui/components/table";
import { cn } from "@roadmaps-faciles/ui/lib/cn";
import { useTranslations } from "next-intl";
import { Fragment, useState, useTransition } from "react";

import { updatePostRoadmapMeta } from "./actions";

interface RoadmapPostsListProps {
  posts: Array<{
    boardName: string;
    eta: null | string;
    id: number;
    progress: null | number;
    statusColor: null | string;
    statusName: null | string;
    title: string;
  }>;
}

interface RowState {
  eta: string;
  progress: string;
}

const initialRowState = (progress: null | number, eta: null | string): RowState => ({
  progress: progress?.toString() ?? "",
  eta: eta ?? "",
});

export const RoadmapPostsList = ({ posts }: RoadmapPostsListProps) => {
  const t = useTranslations("domainAdmin.roadmap");
  const tc = useTranslations("common");
  const [rows, setRows] = useState<Record<number, RowState>>(() =>
    Object.fromEntries(posts.map(p => [p.id, initialRowState(p.progress, p.eta)])),
  );
  const [savingId, setSavingId] = useState<null | number>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [, startTransition] = useTransition();

  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground mt-6">{t("noRoadmapPosts")}</p>;
  }

  const updateRow = (id: number, patch: Partial<RowState>) => {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setErrors(prev => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const isDirty = (post: RoadmapPostsListProps["posts"][number]) => {
    const row = rows[post.id];
    const initial = initialRowState(post.progress, post.eta);
    return row.progress !== initial.progress || row.eta !== initial.eta;
  };

  const handleSave = (postId: number) => {
    const row = rows[postId];
    const trimmed = row.progress.trim();
    const progressNum = trimmed === "" ? null : Number.parseInt(trimmed, 10);
    const etaStr = row.eta.trim() === "" ? null : row.eta.trim();

    if (progressNum != null && (Number.isNaN(progressNum) || progressNum < 0 || progressNum > 100)) {
      setErrors(prev => ({ ...prev, [postId]: t("progressInvalid") }));
      return;
    }

    startTransition(() => setSavingId(postId));
    void updatePostRoadmapMeta({ postId, progress: progressNum, eta: etaStr })
      .then(res => {
        if (!res.ok) {
          setErrors(prev => ({ ...prev, [postId]: res.error ?? tc("error") }));
        }
      })
      .finally(() => setSavingId(null));
  };

  return (
    <section className="mt-10 space-y-3">
      <div>
        <h3 className="text-lg font-semibold">{t("postsListTitle")}</h3>
        <p className="text-sm text-muted-foreground">{t("postsListDescription")}</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("colPost")}</TableHead>
            <TableHead>{t("colStatus")}</TableHead>
            <TableHead className="w-32">{t("colProgress")}</TableHead>
            <TableHead className="w-48">{t("colEta")}</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map(post => {
            const row = rows[post.id];
            const dirty = isDirty(post);
            const error = errors[post.id];
            return (
              <Fragment key={post.id}>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-muted-foreground">{post.boardName}</div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        post.statusColor && `fr-roadmap-column--color-${post.statusColor}`,
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                      )}
                    >
                      {post.statusName ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={row.progress}
                      onChange={e => updateRow(post.id, { progress: e.target.value })}
                      placeholder="0-100"
                      aria-invalid={!!error}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.eta}
                      onChange={e => updateRow(post.id, { eta: e.target.value })}
                      placeholder={t("etaPlaceholder")}
                      aria-invalid={!!error}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" disabled={!dirty || savingId === post.id} onClick={() => handleSave(post.id)}>
                      {savingId === post.id ? tc("saving") : tc("save")}
                    </Button>
                  </TableCell>
                </TableRow>
                {error && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-xs text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
};
