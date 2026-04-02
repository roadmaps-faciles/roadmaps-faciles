"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

import { type UILabelProps } from "./UILabel";

export const UILabelDsfr = ({ children, htmlFor, className }: UILabelProps) => (
  <label htmlFor={htmlFor} className={cx(fr.cx("fr-label"), className)}>
    {children}
  </label>
);
