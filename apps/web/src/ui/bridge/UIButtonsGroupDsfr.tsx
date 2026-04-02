"use client";

import DsfrButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

import { type UIButtonsGroupProps } from "./UIButtonsGroup";

export const UIButtonsGroupDsfr = ({
  buttons,
  className,
  alignment = "left",
  inlineLayoutWhen,
}: UIButtonsGroupProps) => (
  <DsfrButtonsGroup buttons={buttons} className={className} alignment={alignment} inlineLayoutWhen={inlineLayoutWhen} />
);
