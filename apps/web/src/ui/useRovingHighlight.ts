"use client";

import { useCallback, useState } from "react";

interface HighlightRect {
  height: number;
  y: number;
}

/**
 * Roving highlight hook - tracks hovered item position relative to a container.
 * Returns props for a single `motion.div` highlight and handlers for items.
 *
 * The container is resolved via `closest()` on the item's DOM using `containerSelector`.
 */
export const useRovingHighlight = (containerSelector: string) => {
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);

  const handleItemHover = useCallback(
    (e: React.MouseEvent) => {
      const item = e.currentTarget;
      const container = item.closest<HTMLElement>(containerSelector);
      if (!container) return;
      const itemRect = item.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      // Position relative to the scrollable content (not the viewport): the highlight lives inside
      // the scroll container, so adding scrollTop keeps it pinned to the item while scrolling.
      setHighlight({
        y: itemRect.top - containerRect.top + container.scrollTop,
        height: itemRect.height,
      });
    },
    [containerSelector],
  );

  const clearHighlight = useCallback(() => setHighlight(null), []);

  return { clearHighlight, handleItemHover, highlight } as const;
};
