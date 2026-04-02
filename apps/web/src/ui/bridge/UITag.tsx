"use client";

import type DsfrTag from "@codegouvfr/react-dsfr/Tag";

import { Badge as ShadcnBadge, cn } from "@roadmaps-faciles/ui";
import { type ComponentProps, lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UITagDsfr = lazy(() => import("./UITagDsfr").then(m => ({ default: m.UITagDsfr })));

type DsfrTagProps = ComponentProps<typeof DsfrTag>;

export type UITagProps = {
  as?: "span";
  children: React.ReactNode;
  className?: string;
  iconId?: DsfrTagProps["iconId"];
  onClick?: () => void;
  /** Size — "sm" maps to DSFR `small` prop */
  size?: "default" | "sm";
};

export const UITag = ({ children, className, size, iconId, onClick, as }: UITagProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UITagDsfr className={className} size={size} iconId={iconId} onClick={onClick} as={as}>
          {children}
        </UITagDsfr>
      </Suspense>
    );
  }

  const Comp = as === "span" ? "span" : "div";

  return (
    <ShadcnBadge
      variant="outline"
      className={cn(size === "sm" && "text-xs py-0", onClick && "cursor-pointer", className)}
      onClick={onClick}
      asChild
    >
      <Comp>{children}</Comp>
    </ShadcnBadge>
  );
};
