"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cn } from "@roadmaps-faciles/ui";
import { forwardRef, type PropsWithChildren } from "react";

type PolymorphicTag = "article" | "aside" | "div" | "footer" | "header" | "main" | "p" | "section" | "span";

type ClientAnimateBaseProps = PropsWithChildren<
  {
    as?: PolymorphicTag;
    className?: string;
  } & React.HTMLAttributes<HTMLElement>
>;

export interface ClientAnimateProps extends ClientAnimateBaseProps {
  animateOptions?: Parameters<typeof useAutoAnimate>[0];
}

const PolyRef = forwardRef<HTMLElement, ClientAnimateBaseProps>(({ as: Tag = "div", className, ...rest }, ref) => (
  <Tag ref={ref as React.Ref<never>} className={cn(className)} {...rest} />
));

PolyRef.displayName = "PolyRef";

export const ClientAnimate = ({ animateOptions, ...props }: ClientAnimateProps) => {
  const [animationParent] = useAutoAnimate<HTMLElement>(animateOptions);

  return <PolyRef {...props} ref={animationParent} />;
};
