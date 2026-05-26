"use client";

import { Button } from "@roadmaps-faciles/ui/components/button";
import { Input } from "@roadmaps-faciles/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@roadmaps-faciles/ui/components/select";
import { cn } from "@roadmaps-faciles/ui/lib/cn";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { type RoadmapFilter, type RoadmapFilterBarProps, type RoadmapSort } from "./RoadmapFilterBar";
import styles from "./RoadmapFilterBar.module.scss";

const VISIBLE_TAGS = 8;

export const RoadmapFilterBarDefault = ({
  availableTags,
  filter,
  onChange,
  hasProgressSort = true,
}: RoadmapFilterBarProps) => {
  const t = useTranslations("roadmap.filterBar");
  const [showAll, setShowAll] = useState(false);

  const setPart = <K extends keyof RoadmapFilter>(key: K, value: RoadmapFilter[K]) =>
    onChange({ ...filter, [key]: value });

  const visibleTags = showAll ? availableTags : availableTags.slice(0, VISIBLE_TAGS);
  const hiddenCount = availableTags.length - VISIBLE_TAGS;
  const hasMore = hiddenCount > 0;

  return (
    <div className={cn("sticky z-40 border-b border-border/60 bg-background", styles.filterBar)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative flex items-center flex-1 md:w-72 md:flex-initial">
            <Search aria-hidden="true" className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              value={filter.search}
              onChange={e => setPart("search", e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="h-9 pl-9"
            />
          </div>
          <div className="md:ml-auto flex items-center gap-2 text-xs text-muted-foreground shrink-0 md:order-last">
            <span className="hidden sm:inline">{t("sortBy")}</span>
            <Select value={filter.sort} onValueChange={v => setPart("sort", v as RoadmapSort)}>
              <SelectTrigger size="sm" className="h-8 text-xs font-semibold text-foreground gap-1.5 min-w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes">{t("sortVotes")}</SelectItem>
                <SelectItem value="recent">{t("sortRecent")}</SelectItem>
                {hasProgressSort && <SelectItem value="progress">{t("sortProgress")}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>

        {availableTags.length > 0 && (
          <div
            className={cn(
              "flex items-center gap-1.5 min-w-0 md:flex-1 md:flex-wrap",
              !showAll && cn("overflow-x-auto md:overflow-visible", styles.noScrollbar),
              showAll && "flex-wrap",
            )}
          >
            <Button
              type="button"
              variant={filter.selectedTag === null ? "default" : "outline"}
              size="sm"
              className="h-8 rounded-[10px] text-xs font-medium shrink-0"
              onClick={() => setPart("selectedTag", null)}
              aria-pressed={filter.selectedTag === null}
            >
              {t("allCategories")}
            </Button>
            {visibleTags.map(({ tag, count }) => (
              <Button
                key={tag}
                type="button"
                variant={filter.selectedTag === tag ? "default" : "outline"}
                size="sm"
                className="h-8 rounded-[10px] text-xs font-medium gap-1 shrink-0"
                onClick={() => setPart("selectedTag", filter.selectedTag === tag ? null : tag)}
                aria-pressed={filter.selectedTag === tag}
              >
                <span>{tag}</span>
                <span className="text-muted-foreground tabular-nums opacity-70">{count}</span>
              </Button>
            ))}
            {hasMore && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-[10px] text-xs font-medium gap-1 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => setShowAll(s => !s)}
                aria-expanded={showAll}
              >
                {showAll ? (
                  <>
                    {t("showLess")}
                    <ChevronUp className="size-3" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    {t("showMoreTags", { count: hiddenCount })}
                    <ChevronDown className="size-3" aria-hidden="true" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
