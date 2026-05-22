"use client";

import { cn } from "@roadmaps-faciles/ui";
import { lazy, Suspense } from "react";

import { type PostStatusColor } from "@/lib/model/PostStatus";
import { getTone, ROADMAP_TONE_CLASSES } from "@/lib/utils/postStatusTone";
import { useUI } from "@/ui";

const UIRoadmapColumnHeaderDsfr = lazy(() =>
  import("./UIRoadmapColumnHeaderDsfr").then(m => ({ default: m.UIRoadmapColumnHeaderDsfr })),
);

export interface UIRoadmapColumnHeaderProps {
  color: null | PostStatusColor;
  count: number;
  label: string;
}

export const UIRoadmapColumnHeader = ({ color, label, count }: UIRoadmapColumnHeaderProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIRoadmapColumnHeaderDsfr color={color} label={label} count={count} />
      </Suspense>
    );
  }

  const tone = getTone(color);
  const t = ROADMAP_TONE_CLASSES[tone];

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-[10px] border px-3 py-2.5",
        t.border,
        t.bg,
        t.text,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden="true" />
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-[11px] font-semibold tabular-nums opacity-70">{count}</span>
    </div>
  );
};
