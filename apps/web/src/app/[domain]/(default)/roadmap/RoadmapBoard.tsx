"use client";

import { cn } from "@roadmaps-faciles/ui/lib/cn";
import { useIsMobile } from "@roadmaps-faciles/ui/lib/use-mobile";
import { ChevronRight, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { type PostStatusColor } from "@/lib/model/PostStatus";
import { useUI } from "@/ui";
import { UIAlert, UIButton, UIRoadmapColumnHeader, UISegmentedTabs } from "@/ui/bridge";

import emptyStyles from "./RoadmapBoard.module.scss";
import { type AvailableTag, type RoadmapFilter, RoadmapFilterBar, type RoadmapSort } from "./RoadmapFilterBar";
import { RoadmapPostCard, type RoadmapPostCardData } from "./RoadmapPostCard";

interface RoadmapBoardColumn {
  color: PostStatusColor;
  id: number;
  name: string;
}

interface RoadmapBoardProps {
  availableTags: AvailableTag[];
  columns: RoadmapBoardColumn[];
  emptyMessage: string;
  posts: RoadmapPostCardData[];
  showVotes: boolean;
  tenantId: number;
  userId?: string;
}

const sortPosts = (posts: RoadmapPostCardData[], sort: RoadmapSort): RoadmapPostCardData[] => {
  const copy = [...posts];
  switch (sort) {
    case "recent":
      return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "progress":
      return copy.sort((a, b) => (b.progress ?? -1) - (a.progress ?? -1));
    default:
      return copy.sort((a, b) => b.likesCount - a.likesCount);
  }
};

const filterPosts = (posts: RoadmapPostCardData[], filter: RoadmapFilter): RoadmapPostCardData[] => {
  const search = filter.search.trim().toLowerCase();
  return posts.filter(p => {
    if (search) {
      const haystack = `${p.title} ${p.description ?? ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filter.selectedTag && !p.tags.includes(filter.selectedTag)) return false;
    return true;
  });
};

const VISIBLE_PER_COLUMN = 5;

export const RoadmapBoard = ({
  posts,
  columns,
  availableTags,
  showVotes,
  tenantId,
  userId,
  emptyMessage,
}: RoadmapBoardProps) => {
  const t = useTranslations("roadmap");
  const isMobile = useIsMobile();
  const theme = useUI();
  const [filter, setFilter] = useState<RoadmapFilter>({
    search: "",
    selectedTag: null,
    sort: "votes",
  });
  const [activeColumnId, setActiveColumnId] = useState<string>(() => (columns[0] ? String(columns[0].id) : ""));
  const [expandedColumns, setExpandedColumns] = useState<Record<number, boolean>>({});

  const filteredSorted = useMemo(() => sortPosts(filterPosts(posts, filter), filter.sort), [posts, filter]);

  const groupedByColumn = useMemo(() => {
    const map = new Map<number, RoadmapPostCardData[]>();
    columns.forEach(col => map.set(col.id, []));
    filteredSorted.forEach(p => {
      if (p.postStatusId != null && map.has(p.postStatusId)) {
        map.get(p.postStatusId)!.push(p);
      }
    });
    return map;
  }, [filteredSorted, columns]);

  const activeColumn = columns.find(c => String(c.id) === activeColumnId) ?? columns[0];

  const isFilterActive = filter.search.trim() !== "" || filter.selectedTag !== null;
  const totalFiltered = filteredSorted.length;
  const showNoResultsBanner = isFilterActive && totalFiltered === 0;

  const renderColumn = (col: RoadmapBoardColumn, allPosts: RoadmapPostCardData[], dense: boolean) => {
    const expanded = expandedColumns[col.id] ?? false;
    const visible = expanded ? allPosts : allPosts.slice(0, VISIBLE_PER_COLUMN);
    const hasMore = allPosts.length > VISIBLE_PER_COLUMN;

    return (
      <div className="flex flex-col gap-3 min-w-0 h-full">
        <UIRoadmapColumnHeader color={col.color} label={col.name} count={allPosts.length} />
        <div className="flex-1 flex flex-col gap-3">
          {visible.length === 0 ? (
            <div
              className={
                theme === "Dsfr"
                  ? emptyStyles.emptyState
                  : "rounded-xl border border-dashed border-border/40 px-4 py-6 text-center"
              }
            >
              <p
                className={
                  theme === "Dsfr" ? "fr-text--sm fr-text--center fr-m-0" : "text-xs text-muted-foreground text-balance"
                }
              >
                {emptyMessage}
              </p>
            </div>
          ) : (
            visible.map(post => (
              <RoadmapPostCard
                key={post.id}
                post={post}
                showVotes={showVotes}
                tenantId={tenantId}
                userId={userId}
                dense={dense}
              />
            ))
          )}
          {hasMore && (
            <UIButton
              variant="ghost"
              size="sm"
              className="mt-auto"
              onClick={() => setExpandedColumns(prev => ({ ...prev, [col.id]: !expanded }))}
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  <span>{t("column.showLess")}</span>
                  <ChevronUp className="size-3.5" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>{t("column.viewAll", { count: allPosts.length })}</span>
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </>
              )}
            </UIButton>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <RoadmapFilterBar
        availableTags={availableTags}
        filter={filter}
        onChange={setFilter}
        hasProgressSort={posts.some(p => p.progress != null)}
      />

      {showNoResultsBanner && (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-6 w-full">
          <UIAlert variant="default" description={t("noResults")} />
        </div>
      )}

      {isMobile ? (
        <section className="mx-auto max-w-7xl px-4 pt-4 pb-16">
          {columns.length > 0 && (
            <UISegmentedTabs
              name="roadmap-status"
              legend={t("title")}
              value={activeColumnId}
              onValueChange={setActiveColumnId}
              segments={columns.map(c => ({
                value: String(c.id),
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    {c.name}
                    <span className="text-[10px] opacity-60 tabular-nums">
                      {groupedByColumn.get(c.id)?.length ?? 0}
                    </span>
                  </span>
                ),
              }))}
              className="mb-4"
            />
          )}
          {activeColumn && renderColumn(activeColumn, groupedByColumn.get(activeColumn.id) ?? [], true)}
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-6 lg:px-8 pt-6 pb-16">
          <div
            className={cn("grid gap-5 items-stretch", {
              "grid-cols-1": columns.length === 1,
              "grid-cols-2": columns.length === 2,
              "grid-cols-3": columns.length === 3,
              "grid-cols-4": columns.length === 4,
              "grid-cols-5": columns.length >= 5,
            })}
          >
            {columns.map(col => (
              <div key={col.id} className="h-full">
                {renderColumn(col, groupedByColumn.get(col.id) ?? [], false)}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};
