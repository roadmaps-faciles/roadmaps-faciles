"use client";

import type DsfrButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

import { cn } from "@roadmaps-faciles/ui";
import { type ComponentProps, lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UIButtonsGroupDsfr = lazy(() => import("./UIButtonsGroupDsfr").then(m => ({ default: m.UIButtonsGroupDsfr })));

type DsfrButtonsGroupProps = ComponentProps<typeof DsfrButtonsGroup>;

export type UIButtonsGroupProps = {
  alignment?: "center" | "left" | "right";
  buttons: DsfrButtonsGroupProps["buttons"];
  className?: string;
  inlineLayoutWhen?: DsfrButtonsGroupProps["inlineLayoutWhen"];
  size?: "large" | "medium" | "small";
};

const ALIGNMENT_MAP = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

export const UIButtonsGroup = ({
  buttons,
  className,
  alignment = "left",
  inlineLayoutWhen,
  size: _size,
}: UIButtonsGroupProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIButtonsGroupDsfr
          buttons={buttons}
          className={className}
          alignment={alignment}
          inlineLayoutWhen={inlineLayoutWhen}
        />
      </Suspense>
    );
  }

  // In Default theme, render as a simple flex wrapper.
  // Each DSFR button prop is mapped to a basic <button>.
  return (
    <div className={cn("flex flex-wrap gap-2", ALIGNMENT_MAP[alignment], className)}>
      {buttons.map((btn, i) => (
        <button
          key={i}
          type="button"
          onClick={"onClick" in btn ? (btn.onClick as React.MouseEventHandler) : undefined}
          disabled={"disabled" in btn ? (btn.disabled as boolean) : undefined}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {btn.children}
        </button>
      ))}
    </div>
  );
};
