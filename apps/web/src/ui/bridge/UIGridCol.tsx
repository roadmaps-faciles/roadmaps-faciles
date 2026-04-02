"use client";

import { cn } from "@roadmaps-faciles/ui";
import { type PropsWithChildren } from "react";

import { useUI } from "@/ui";

type ColSize = 1 | 10 | 11 | 12 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type UIGridColProps = PropsWithChildren<{
  className?: string;
  lg?: ColSize;
  md?: ColSize;
  offset?: ColSize;
  sm?: ColSize;
  span?: ColSize | false;
  xl?: ColSize;
}>;

// ---------- DSFR col class builder ----------

function buildDsfrColClasses({
  lg,
  md,
  offset,
  sm,
  span = 12,
  xl,
}: Omit<UIGridColProps, "children" | "className">): string {
  const classes: string[] = [];
  if (span !== false) classes.push(`fr-col-${span}`);
  if (sm) classes.push(`fr-col-sm-${sm}`);
  if (md) classes.push(`fr-col-md-${md}`);
  if (lg) classes.push(`fr-col-lg-${lg}`);
  if (xl) classes.push(`fr-col-xl-${xl}`);
  if (offset) classes.push(`fr-col-offset-${offset}`);
  return classes.join(" ");
}

// ---------- Default (Tailwind) col class maps ----------
// Static string literals for Tailwind scanner detection.

const COL_SPAN: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

const SM_COL: Record<number, string> = {
  1: "sm:col-span-1",
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  5: "sm:col-span-5",
  6: "sm:col-span-6",
  7: "sm:col-span-7",
  8: "sm:col-span-8",
  9: "sm:col-span-9",
  10: "sm:col-span-10",
  11: "sm:col-span-11",
  12: "sm:col-span-12",
};

const MD_COL: Record<number, string> = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  11: "md:col-span-11",
  12: "md:col-span-12",
};

const LG_COL: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

const XL_COL: Record<number, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
};

const COL_START: Record<number, string> = {
  1: "col-start-1",
  2: "col-start-2",
  3: "col-start-3",
  4: "col-start-4",
  5: "col-start-5",
  6: "col-start-6",
  7: "col-start-7",
  8: "col-start-8",
  9: "col-start-9",
  10: "col-start-10",
  11: "col-start-11",
  12: "col-start-12",
};

function buildDefaultColClasses({
  lg,
  md,
  offset,
  sm,
  span = 12,
  xl,
}: Omit<UIGridColProps, "children" | "className">): string {
  const classes: string[] = [];
  if (span !== false) classes.push(COL_SPAN[span] ?? "col-span-12");
  if (sm) classes.push(SM_COL[sm] ?? "");
  if (md) classes.push(MD_COL[md] ?? "");
  if (lg) classes.push(LG_COL[lg] ?? "");
  if (xl) classes.push(XL_COL[xl] ?? "");
  if (offset) classes.push(COL_START[offset + 1] ?? "");
  return classes.filter(Boolean).join(" ");
}

// ---------- Component ----------

export const UIGridCol = ({ children, className, lg, md, offset, sm, span, xl }: UIGridColProps) => {
  const theme = useUI();
  const colProps = { lg, md, offset, sm, span, xl };

  if (theme === "Dsfr") {
    return <div className={cn(buildDsfrColClasses(colProps), className)}>{children}</div>;
  }

  return <div className={cn(buildDefaultColClasses(colProps), className)}>{children}</div>;
};
