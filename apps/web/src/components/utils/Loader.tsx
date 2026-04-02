import { cn } from "@roadmaps-faciles/ui";
import { type ReactNode } from "react";
import { PulseLoader } from "react-spinners";

export interface LoaderProps {
  className?: string;
  color?: string;
  loading: boolean;
  size?: string;
  text?: ReactNode;
}

export const Loader = ({ loading, text = null, size = "1em", color = "currentColor", className }: LoaderProps) =>
  loading ? <PulseLoader className={cn(className)} size={size} color={color} /> : text;
