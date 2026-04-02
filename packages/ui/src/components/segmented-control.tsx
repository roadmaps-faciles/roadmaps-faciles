"use client";

/**
 * Segmented control for switching between exclusive options.
 * Compound: `SegmentedControl` > `SegmentedControlItem`.
 * Built on Radix ToggleGroup for keyboard navigation and accessibility.
 */

import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

type SingleToggleGroupProps = Extract<ComponentProps<typeof ToggleGroupPrimitive.Root>, { type: "single" }>;

function SegmentedControl({ className, ...props }: Omit<SingleToggleGroupProps, "type">) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="segmented-control"
      type="single"
      className={cn("inline-flex items-center gap-0.5 rounded-lg border p-1", className)}
      {...props}
    />
  );
}

function SegmentedControlItem({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all",
        "text-muted-foreground hover:text-foreground",
        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm",
        "focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1",
        "ui-disabled",
        "ui-svg-icon",
        className,
      )}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlItem };
