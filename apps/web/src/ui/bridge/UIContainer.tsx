"use client";

import { cn } from "@roadmaps-faciles/ui";
import { type PropsWithChildren } from "react";

import { useUI } from "@/ui";

export type UIContainerProps = PropsWithChildren<{
  className?: string;
  fluid?: boolean;
}>;

export const UIContainer = ({ children, className, fluid }: UIContainerProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return <div className={cn("fr-container", fluid && "fr-container--fluid", className)}>{children}</div>;
  }

  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", fluid ? "max-w-none" : "max-w-7xl", className)}>
      {children}
    </div>
  );
};
