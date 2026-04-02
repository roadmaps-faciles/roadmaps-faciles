"use client";

/** Accessible toggle with smooth thumb transition. Supports `sm` size variant. */

import { Switch as SwitchPrimitive } from "radix-ui";
import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

/** @param size `"default"` or `"sm"` (compact track + thumb). */
function Switch({
  className,
  size = "default",
  ...props
}: {
  size?: "default" | "sm";
} & ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input ui-focus-ring dark:data-[state=unchecked]:bg-input/80 group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none ui-disabled data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
