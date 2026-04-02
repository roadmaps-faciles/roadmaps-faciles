"use client";

/**
 * Tabbed interface with horizontal or vertical orientation.
 * Compound: `Tabs` > `TabsList` > `TabsTrigger` + `TabsContent`.
 *
 * Variants:
 * - `default` -- Bordered container with primary pill on active tab (matches segmented control look)
 * - `line` -- Transparent background with active underline indicator
 */

import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

/** @param orientation `"horizontal"` (default) or `"vertical"` -- switches flex direction and active indicator axis. */
function Tabs({ className, orientation = "horizontal", ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", className)}
      {...props}
    />
  );
}

/**
 * TabsList style variants.
 * - `default` -- Bordered container, active tab gets primary pill
 * - `line` -- Transparent background with active underline indicator
 */
const tabsListVariants = cva(
  "group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "gap-0.5 rounded-lg border p-1 group-data-[orientation=horizontal]/tabs:h-9",
        line: "gap-1 bg-transparent rounded-none p-0 group-data-[orientation=horizontal]/tabs:h-9",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base styles
        "focus-visible:ring-ring/50 focus-visible:outline-ring text-muted-foreground hover:text-foreground relative inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 ui-disabled ui-svg-icon",

        // Default variant: active tab gets primary pill
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-primary group-data-[variant=default]/tabs-list:data-[state=active]:text-primary-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm",

        // Line variant: no background, underline indicator
        "group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none",

        // Active text color (line variant only — default uses primary-foreground)
        "group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground",

        // Line variant underline pseudo-element
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
