"use client";

/** Vertical activity timeline. Compound: `Timeline` > `TimelineItem` > `TimelineSeparator` + `TimelineContent`. */

import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

/**
 * TimelineDot style variants.
 * - `default` -- Primary color filled dot
 * - `outline` -- Bordered dot with transparent background
 * - `success` -- Green dot
 * - `warning` -- Amber dot
 * - `destructive` -- Red dot
 * - `muted` -- Subdued dot for inactive/past items
 */
const timelineDotVariants = cva("relative z-10 flex shrink-0 items-center justify-center rounded-full", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      outline: "border-2 border-primary bg-background text-primary",
      success: "bg-success text-white",
      warning: "bg-warning text-white",
      destructive: "bg-destructive text-white",
      muted: "bg-muted-foreground/20 text-muted-foreground",
    },
    size: {
      sm: "size-2",
      default: "size-3",
      lg: "size-4",
      icon: "size-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

function Timeline({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="timeline" className={cn("flex flex-col", className)} {...props} />;
}

function TimelineItem({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-item"
      className={cn("group/timeline-item relative flex gap-x-3 pb-8 last:pb-0", className)}
      {...props}
    />
  );
}

function TimelineSeparator({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="timeline-separator" className={cn("flex flex-col items-center", className)} {...props} />;
}

function TimelineDot({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"div"> & VariantProps<typeof timelineDotVariants>) {
  return (
    <div
      data-slot="timeline-dot"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      className={cn(timelineDotVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * Vertical line between two dots.
 * - Default (`connected`): stretches with negative margin to touch the next dot
 * - `spaced`: stays within item bounds with visible gaps on both sides
 */
function TimelineConnector({
  className,
  variant = "spaced",
  ...props
}: { variant?: "connected" | "spaced" } & ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-connector"
      className={cn(
        "bg-border w-[3px] flex-1 group-last/timeline-item:hidden",
        variant === "connected" && "-mb-8 group-last/timeline-item:mb-0",
        variant === "spaced" && "mt-2 -mb-6",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Wrapper for nested reply threads. Each `TimelineSubItem` inside gets a vertical
 * connector on its left. The last child gets a rounded L-hook stopping at its vertical center.
 *
 * Uses the same visual pattern as DSFR ThreadEntity (`flex: 0.5` on last item's line).
 */
/**
 * Full static class strings so Tailwind JIT can detect them at build time.
 * Controls the padding (indent) of the threadline column in sub-items.
 */
const subIndentClasses = {
  sm: "[&_[data-slot=sub-threadline]]:w-6",
  default: "[&_[data-slot=sub-threadline]]:w-8",
  lg: "[&_[data-slot=sub-threadline]]:w-12",
} as const;

const subIndentLeftClasses = {
  sm: "[&_[data-slot=sub-threadline]]:ml-6",
  default: "[&_[data-slot=sub-threadline]]:ml-8",
  lg: "[&_[data-slot=sub-threadline]]:ml-12",
} as const;

function TimelineSubConnector({
  className,
  children,
  indent = "default",
  ...props
}: { indent?: keyof typeof subIndentClasses } & ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-sub-connector"
      className={cn(
        "flex flex-col",
        // Propagate indent to all sub-threadlines (full static class for JIT)
        subIndentClasses[indent],
        // Last sub-item: line stops at 50% of content height, hook shown, no right padding on threadline
        "[&>:last-child_[data-slot=sub-line]]:flex-[0.5]",
        "[&>:last-child_[data-slot=sub-hook]]:block",
        subIndentLeftClasses[indent],
        "[&>:last-child_[data-slot=sub-threadline]]:mr-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Individual threaded item with connector line on the left. Use inside `TimelineSubConnector`. */
function TimelineSubItem({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="timeline-sub-item" className={cn("flex", className)} {...props}>
      {/* Threadline column: line flush left, hook width controlled by parent indent */}
      <div data-slot="sub-threadline" className="flex shrink-0 flex-col">
        {/* Vertical line segment — takes remaining space */}
        <div data-slot="sub-line" className="border-border flex-1 border-l-2" />
        {/* Horizontal hook — rounded L-shape, fills threadline width.
            Hidden by default, shown on last sub-item via parent selector.
            flex:0.5 on sub-line + this height ≈ vertical center of content. */}
        <div data-slot="sub-hook" className="border-border hidden h-4 w-full rounded-bl-xl border-b-2 border-l-2" />
      </div>
      {/* Content */}
      <div className="flex flex-1 flex-col py-1">{children}</div>
    </div>
  );
}

function TimelineContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="timeline-content" className={cn("flex-1 pt-0.5 pb-1", className)} {...props} />;
}

export {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  timelineDotVariants,
  TimelineConnector,
  TimelineSubConnector,
  TimelineSubItem,
  TimelineContent,
};
