"use client";

import DsfrBadge from "@codegouvfr/react-dsfr/Badge";

import { type UIBadgeProps } from "./UIBadge";

const VARIANT_TO_SEVERITY = {
  default: "info",
  secondary: "info",
  destructive: "error",
  outline: "info",
  success: "success",
  warning: "warning",
  ghost: "info",
  link: "info",
} as const;

export const UIBadgeDsfr = ({ variant = "default", children, className, size }: UIBadgeProps) => (
  <DsfrBadge
    as="span"
    noIcon
    severity={VARIANT_TO_SEVERITY[variant ?? "default"]}
    small={size === "sm"}
    className={className}
  >
    {children as NonNullable<React.ReactNode>}
  </DsfrBadge>
);
