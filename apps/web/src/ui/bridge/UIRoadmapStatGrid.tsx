"use client";

import { cn } from "@roadmaps-faciles/ui";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UIRoadmapStatGridDsfr = lazy(() =>
  import("./UIRoadmapStatGridDsfr").then(m => ({ default: m.UIRoadmapStatGridDsfr })),
);

export interface RoadmapStat {
  label: string;
  sublabel?: string;
  value: number | string;
}

export interface UIRoadmapStatGridProps {
  className?: string;
  stats: RoadmapStat[];
}

export const UIRoadmapStatGrid = ({ stats, className }: UIRoadmapStatGridProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIRoadmapStatGridDsfr stats={stats} className={className} />
      </Suspense>
    );
  }

  if (stats.length === 0) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-px rounded-xl border border-border/60 overflow-hidden bg-border/60",
        className,
      )}
    >
      {stats.map((stat, i) => (
        <div key={`${stat.label}-${i}`} className="bg-card px-4 py-3 sm:px-6 sm:py-5">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">
            {stat.label}
          </div>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {stat.value}
            </span>
            {stat.sublabel && <span className="text-xs text-muted-foreground hidden sm:inline">{stat.sublabel}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
