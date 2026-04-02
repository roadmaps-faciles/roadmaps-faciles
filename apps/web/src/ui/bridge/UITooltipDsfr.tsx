"use client";

import DsfrTooltip from "@codegouvfr/react-dsfr/Tooltip";

import { type UITooltipProps } from "./UITooltip";

export const UITooltipDsfr = ({ children, title }: UITooltipProps) => (
  <DsfrTooltip title={title}>{children}</DsfrTooltip>
);
