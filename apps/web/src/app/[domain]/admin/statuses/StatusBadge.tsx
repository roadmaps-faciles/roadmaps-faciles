import { cn } from "@roadmaps-faciles/ui";

import { type PostStatusColor } from "@/lib/model/PostStatus";

/**
 * Approximate DSFR contrast badge colors for Default theme (no DSFR CSS dependency).
 * Keys match `PostStatusColor` values (camelCase enum keys).
 * Uses Tailwind arbitrary values — all values are static and scanned by JIT at build time.
 */
const STATUS_COLOR_CLASSES: Record<PostStatusColor, string> = {
  grey: "text-[#3a3a3a] bg-[#eee]",
  gray: "text-[#3a3a3a] bg-[#eee]",
  blueFrance: "text-[#000091] bg-[#e3e3fd]",
  redMarianne: "text-[#ce0500] bg-[#fce7e7]",
  greenTilleulVerveine: "text-[#66673d] bg-[#fceeac]",
  greenBourgeon: "text-[#447049] bg-[#c9fcac]",
  greenEmeraude: "text-[#297254] bg-[#c3fad5]",
  greenMenthe: "text-[#37635f] bg-[#bafaee]",
  greenArchipel: "text-[#006a6f] bg-[#c7f6fc]",
  blueEcume: "text-[#2f4077] bg-[#e9edfe]",
  blueCumulus: "text-[#3558a2] bg-[#dde5f5]",
  purpleGlycine: "text-[#6e445a] bg-[#fee7fc]",
  pinkMacaron: "text-[#8d533e] bg-[#fee9e6]",
  pinkTuile: "text-[#a94645] bg-[#fee9e7]",
  yellowTournesol: "text-[#716043] bg-[#feecc2]",
  yellowMoutarde: "text-[#695240] bg-[#feebd0]",
  orangeTerreBattue: "text-[#755348] bg-[#fee9e5]",
  brownCafeCreme: "text-[#685c48] bg-[#f7ecdb]",
  brownCaramel: "text-[#845d48] bg-[#f7ebe5]",
  brownOpera: "text-[#745b47] bg-[#f7ece4]",
  beigeGrisGalet: "text-[#6a6156] bg-[#f3ede5]",
  info: "text-[#0063cb] bg-[#e8edff]",
  success: "text-[#18753c] bg-[#b8fec9]",
  warning: "text-[#b34000] bg-[#ffe9e6]",
  error: "text-[#ce0500] bg-[#ffe9e9]",
};

interface StatusBadgeProps {
  children: React.ReactNode;
  className?: string;
  color: PostStatusColor;
  size?: "lg" | "sm";
}

export const StatusBadge = ({ color, size = "sm", className, children }: StatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-sm font-medium",
      size === "lg" ? "px-2 py-1 text-sm" : "px-1.5 py-0.5 text-xs",
      STATUS_COLOR_CLASSES[color],
      className,
    )}
  >
    {children}
  </span>
);
