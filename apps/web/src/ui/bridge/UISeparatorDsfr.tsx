"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

import { type UISeparatorProps } from "./UISeparator";

export const UISeparatorDsfr = ({ className }: UISeparatorProps) => <hr className={cx(fr.cx("fr-hr"), className)} />;
