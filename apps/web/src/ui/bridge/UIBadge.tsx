"use client";

import { Badge as ShadcnBadge, cn } from "@roadmaps-faciles/ui";
import { type ComponentProps, lazy, Suspense } from "react";

import { POST_STATUS_COLOR_MAP, type PostStatusColor } from "@/lib/model/PostStatus";
import { useUI } from "@/ui";

const UIBadgeDsfr = lazy(() => import("./UIBadgeDsfr").then(m => ({ default: m.UIBadgeDsfr })));

type ShadcnBadgeProps = ComponentProps<typeof ShadcnBadge>;

export type UIBadgeProps = {
  children: React.ReactNode;
  className?: string;
  /** Size — "sm" maps to DSFR `small` prop */
  size?: "default" | "sm";
  /** Post status color — applies DSFR color class or Default inline style */
  statusColor?: PostStatusColor;
  variant?: ShadcnBadgeProps["variant"];
};

/**
 * Minimal oklch palette for post status colors in Default theme.
 * Maps DSFR color names → [text, background] oklch pairs.
 */
const STATUS_COLOR_STYLES: Record<string, { bg: string; text: string }> = {
  grey: { text: "oklch(0.35 0 0)", bg: "oklch(0.92 0 0)" },
  gray: { text: "oklch(0.35 0 0)", bg: "oklch(0.92 0 0)" },
  blueFrance: { text: "oklch(0.30 0.08 265)", bg: "oklch(0.92 0.03 265)" },
  redMarianne: { text: "oklch(0.40 0.15 25)", bg: "oklch(0.92 0.04 25)" },
  greenTilleulVerveine: { text: "oklch(0.40 0.10 120)", bg: "oklch(0.94 0.04 120)" },
  greenBourgeon: { text: "oklch(0.38 0.10 145)", bg: "oklch(0.93 0.04 145)" },
  greenEmeraude: { text: "oklch(0.35 0.10 165)", bg: "oklch(0.93 0.04 165)" },
  greenMenthe: { text: "oklch(0.35 0.08 180)", bg: "oklch(0.93 0.03 180)" },
  greenArchipel: { text: "oklch(0.35 0.08 195)", bg: "oklch(0.93 0.03 195)" },
  blueEcume: { text: "oklch(0.35 0.08 240)", bg: "oklch(0.93 0.03 240)" },
  blueCumulus: { text: "oklch(0.35 0.08 250)", bg: "oklch(0.93 0.03 250)" },
  purpleGlycine: { text: "oklch(0.35 0.10 300)", bg: "oklch(0.93 0.04 300)" },
  pinkMacaron: { text: "oklch(0.40 0.10 350)", bg: "oklch(0.93 0.04 350)" },
  pinkTuile: { text: "oklch(0.40 0.12 15)", bg: "oklch(0.93 0.04 15)" },
  yellowTournesol: { text: "oklch(0.40 0.10 85)", bg: "oklch(0.95 0.05 85)" },
  yellowMoutarde: { text: "oklch(0.40 0.10 80)", bg: "oklch(0.94 0.05 80)" },
  orangeTerreBattue: { text: "oklch(0.40 0.12 45)", bg: "oklch(0.93 0.04 45)" },
  brownCafeCreme: { text: "oklch(0.38 0.06 60)", bg: "oklch(0.93 0.03 60)" },
  brownCaramel: { text: "oklch(0.38 0.08 55)", bg: "oklch(0.93 0.03 55)" },
  brownOpera: { text: "oklch(0.38 0.06 40)", bg: "oklch(0.93 0.03 40)" },
  beigeGrisGalet: { text: "oklch(0.38 0.03 60)", bg: "oklch(0.93 0.02 60)" },
  info: { text: "oklch(0.30 0.08 265)", bg: "oklch(0.92 0.03 265)" },
  success: { text: "oklch(0.35 0.10 155)", bg: "oklch(0.93 0.04 155)" },
  warning: { text: "oklch(0.40 0.10 80)", bg: "oklch(0.94 0.05 80)" },
  error: { text: "oklch(0.40 0.15 25)", bg: "oklch(0.92 0.04 25)" },
};

export const UIBadge = ({ variant = "default", children, className, size, statusColor }: UIBadgeProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <UIBadgeDsfr
          variant={variant}
          size={size}
          className={cn(statusColor && `fr-badge--color-${POST_STATUS_COLOR_MAP[statusColor]}`, className)}
        >
          {children}
        </UIBadgeDsfr>
      </Suspense>
    );
  }

  const colorStyle = statusColor ? STATUS_COLOR_STYLES[statusColor] : undefined;

  return (
    <ShadcnBadge
      variant={statusColor ? "outline" : variant}
      className={cn(size === "sm" && "text-[0.625rem] px-1.5 py-0", className)}
      style={
        colorStyle ? { color: colorStyle.text, backgroundColor: colorStyle.bg, borderColor: "transparent" } : undefined
      }
    >
      {children}
    </ShadcnBadge>
  );
};
