"use client";

import DsfrButton from "@codegouvfr/react-dsfr/Button";

import { type UIButtonProps } from "./UIButton";

const VARIANT_TO_PRIORITY = {
  default: "primary",
  secondary: "secondary",
  destructive: "primary",
  outline: "tertiary",
  ghost: "tertiary no outline",
  link: "tertiary no outline",
} as const;

const SIZE_TO_DSFR: Record<string, "large" | "medium" | "small"> = {
  default: "medium",
  xs: "small",
  sm: "small",
  lg: "large",
  icon: "small",
  "icon-xs": "small",
  "icon-sm": "small",
  "icon-lg": "large",
};

export const UIButtonDsfr = ({
  variant = "default",
  size = "default",
  children,
  className,
  linkProps,
  "aria-expanded": ariaExpanded,
  "aria-pressed": ariaPressed,
  ...props
}: UIButtonProps) => {
  if (linkProps) {
    return (
      <DsfrButton
        priority={VARIANT_TO_PRIORITY[variant ?? "default"]}
        size={SIZE_TO_DSFR[size ?? "default"]}
        className={className}
        linkProps={linkProps}
      >
        {children}
      </DsfrButton>
    );
  }
  const nativeButtonProps =
    ariaExpanded !== undefined || ariaPressed !== undefined
      ? { "aria-expanded": ariaExpanded, "aria-pressed": ariaPressed }
      : undefined;
  return (
    <DsfrButton
      priority={VARIANT_TO_PRIORITY[variant ?? "default"]}
      size={SIZE_TO_DSFR[size ?? "default"]}
      className={className}
      nativeButtonProps={nativeButtonProps}
      {...props}
    >
      {children}
    </DsfrButton>
  );
};
