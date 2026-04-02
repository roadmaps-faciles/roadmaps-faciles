"use client";

import { cn } from "@roadmaps-faciles/ui";
import { forwardRef, type PropsWithChildren } from "react";

import { useUI } from "@/ui";

export type UIGridProps = PropsWithChildren<{
  align?: "center" | "left" | "right";
  className?: string;
  gap?: boolean;
  valign?: "bottom" | "middle" | "top";
}>;

export const UIGrid = forwardRef<HTMLDivElement, UIGridProps>(({ align, children, className, gap, valign }, ref) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <div
        ref={ref}
        className={cn(
          "fr-grid-row",
          gap && "fr-grid-row--gutters",
          align && `fr-grid-row--${align}`,
          valign && `fr-grid-row--${valign}`,
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-12",
        gap && "gap-6",
        align === "center" && "justify-items-center",
        align === "right" && "justify-items-end",
        valign === "middle" && "items-center",
        valign === "bottom" && "items-end",
        valign === "top" && "items-start",
        className,
      )}
    >
      {children}
    </div>
  );
});

UIGrid.displayName = "UIGrid";
