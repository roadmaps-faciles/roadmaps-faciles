import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names with Tailwind-aware deduplication. Combines `clsx` + `twMerge`. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
