"use client";

import DsfrTag from "@codegouvfr/react-dsfr/Tag";
import { type ComponentProps } from "react";

import { type UITagProps } from "./UITag";

type DsfrTagProps = ComponentProps<typeof DsfrTag>;

export const UITagDsfr = ({ children, className, size, iconId, onClick, as }: UITagProps) => {
  // DSFR Tag has nested discriminated unions (WithIcon/WithoutIcon × AsSpan/AsButton/etc.)
  // Use type assertion to avoid combinatorial explosion of branches.
  const dsfrProps = {
    className,
    small: size === "sm",
    ...(iconId && { iconId }),
    ...(onClick && as === "span" && { nativeSpanProps: { onClick } }),
    ...(onClick && as !== "span" && { nativeButtonProps: { onClick } }),
    ...(as && { as }),
  } as DsfrTagProps;

  return <DsfrTag {...dsfrProps}>{children}</DsfrTag>;
};
