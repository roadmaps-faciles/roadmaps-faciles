"use client";

/** Horizontal progress bar with animated fill based on `value` (0-100). Renders an indeterminate animation when `value` is `undefined` or `null`. */

import { Progress as ProgressPrimitive } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

function Progress({ className, value, ...props }: ComponentProps<typeof ProgressPrimitive.Root>) {
  const isIndeterminate = value == null;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full flex-1 transition-all",
          isIndeterminate ? "w-1/3 animate-progress-indeterminate" : "w-full",
        )}
        style={isIndeterminate ? undefined : { transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
