"use client";

import { cn } from "@roadmaps-faciles/ui";
import { type ReactNode, useState } from "react";

export interface HoverTogglerProps {
  as?: "div" | "span";
  className?: string;
  hover: ReactNode;
  normal: ReactNode;
}

export const HoverToggler = ({ normal, hover, as: Component = "div", className }: HoverTogglerProps) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <Component onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} className={cn(className)}>
      {isHover ? hover : normal}
    </Component>
  );
};
