/** Styled text input with file upload support. Handles focus ring, validation state, and dark mode. */

import { type ComponentProps } from "react";

import { cn } from "../lib/cn";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium ui-disabled md:text-sm",
        "ui-focus-ring",
        "ui-invalid-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
