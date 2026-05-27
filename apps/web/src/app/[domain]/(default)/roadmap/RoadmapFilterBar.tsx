"use client";

import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

import { RoadmapFilterBarDefault } from "./RoadmapFilterBarDefault";

const RoadmapFilterBarDsfr = lazy(() =>
  import("./RoadmapFilterBarDsfr").then(m => ({ default: m.RoadmapFilterBarDsfr })),
);

export type RoadmapSort = "progress" | "recent" | "votes";

export interface RoadmapFilter {
  search: string;
  selectedTag: null | string;
  sort: RoadmapSort;
}

export interface AvailableTag {
  count: number;
  tag: string;
}

export interface RoadmapFilterBarProps {
  availableTags: AvailableTag[];
  filter: RoadmapFilter;
  hasProgressSort?: boolean;
  onChange: (next: RoadmapFilter) => void;
}

export const RoadmapFilterBar = (props: RoadmapFilterBarProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense fallback={<RoadmapFilterBarDefault {...props} />}>
        <RoadmapFilterBarDsfr {...props} />
      </Suspense>
    );
  }

  return <RoadmapFilterBarDefault {...props} />;
};
