"use client";

import { Button as ShadcnButton } from "@roadmaps-faciles/ui";
import Link from "next/link";
import { type ComponentProps, lazy, Suspense } from "react";

import { useUI } from "@/ui";

const UIButtonDsfr = lazy(() => import("./UIButtonDsfr").then(m => ({ default: m.UIButtonDsfr })));

type ShadcnButtonProps = ComponentProps<typeof ShadcnButton>;

export type UIButtonProps = {
  "aria-expanded"?: boolean;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  linkProps?: { href: string; target?: string };
  onClick?: () => void;
  size?: ShadcnButtonProps["size"];
  title?: string;
  type?: "button" | "reset" | "submit";
  variant?: ShadcnButtonProps["variant"];
};

export const UIButton = ({
  variant = "default",
  size = "default",
  children,
  className,
  linkProps,
  ...props
}: UIButtonProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIButtonDsfr variant={variant} size={size} className={className} linkProps={linkProps} {...props}>
          {children}
        </UIButtonDsfr>
      </Suspense>
    );
  }

  if (linkProps) {
    return (
      <ShadcnButton variant={variant} size={size} className={className} asChild>
        <Link href={linkProps.href} target={linkProps.target}>
          {children}
        </Link>
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton variant={variant} size={size} className={className} {...props}>
      {children}
    </ShadcnButton>
  );
};
