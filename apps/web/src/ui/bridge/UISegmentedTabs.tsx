"use client";

import { SegmentedControl, SegmentedControlItem } from "@roadmaps-faciles/ui/components/segmented-control";
import { cn } from "@roadmaps-faciles/ui/lib/cn";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UISegmentedTabsDsfr = lazy(() => import("./UISegmentedTabsDsfr").then(m => ({ default: m.UISegmentedTabsDsfr })));

export interface UISegmentedTabsSegment {
  label: React.ReactNode;
  value: string;
}

export interface UISegmentedTabsProps {
  className?: string;
  legend: string;
  name: string;
  onValueChange: (value: string) => void;
  segments: UISegmentedTabsSegment[];
  value: string;
}

export const UISegmentedTabs = ({ segments, value, onValueChange, name, legend, className }: UISegmentedTabsProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UISegmentedTabsDsfr
          segments={segments}
          value={value}
          onValueChange={onValueChange}
          name={name}
          legend={legend}
          className={className}
        />
      </Suspense>
    );
  }

  return (
    <SegmentedControl
      value={value}
      onValueChange={v => v && onValueChange(v)}
      className={cn("w-full grid grid-flow-col auto-cols-fr", className)}
      aria-label={legend}
    >
      {segments.map(seg => (
        <SegmentedControlItem key={seg.value} value={seg.value}>
          {seg.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
};
