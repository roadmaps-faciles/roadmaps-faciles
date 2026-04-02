"use client";

import { Label as ShadcnLabel } from "@roadmaps-faciles/ui";
import { lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UILabelDsfr = lazy(() => import("./UILabelDsfr").then(m => ({ default: m.UILabelDsfr })));

export type UILabelProps = {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

export const UILabel = ({ children, htmlFor, className }: UILabelProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UILabelDsfr htmlFor={htmlFor} className={className}>
          {children}
        </UILabelDsfr>
      </Suspense>
    );
  }

  return (
    <ShadcnLabel htmlFor={htmlFor} className={className}>
      {children}
    </ShadcnLabel>
  );
};
