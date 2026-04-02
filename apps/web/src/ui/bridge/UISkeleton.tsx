"use client";

import { cn, Skeleton as ShadcnSkeleton } from "@roadmaps-faciles/ui";

import { useUI } from "@/ui";

export type UISkeletonProps = {
  className?: string;
};

export const UISkeleton = ({ className }: UISkeletonProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return <div className={cn("animate-pulse rounded bg-[var(--background-contrast-grey)]", className)} />;
  }

  return <ShadcnSkeleton className={className} />;
};
