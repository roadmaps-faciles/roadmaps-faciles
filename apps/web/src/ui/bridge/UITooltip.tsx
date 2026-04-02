"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@roadmaps-faciles/ui";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UITooltipDsfr = lazy(() => import("./UITooltipDsfr").then(m => ({ default: m.UITooltipDsfr })));

export type UITooltipProps = {
  children: React.ReactNode;
  title: string;
};

export const UITooltip = ({ children, title }: UITooltipProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UITooltipDsfr title={title}>{children}</UITooltipDsfr>
      </Suspense>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{children}</span>
        </TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
