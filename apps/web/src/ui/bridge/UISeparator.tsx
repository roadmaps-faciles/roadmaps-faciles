"use client";

import { Separator as ShadcnSeparator } from "@roadmaps-faciles/ui";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UISeparatorDsfr = lazy(() => import("./UISeparatorDsfr").then(m => ({ default: m.UISeparatorDsfr })));

export type UISeparatorProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export const UISeparator = ({ className, orientation = "horizontal" }: UISeparatorProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UISeparatorDsfr className={className} />
      </Suspense>
    );
  }

  return <ShadcnSeparator orientation={orientation} className={className} />;
};
