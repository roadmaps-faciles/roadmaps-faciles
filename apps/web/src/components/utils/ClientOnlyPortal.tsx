"use client";
import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ClientOnlyPortalProps = PropsWithChildren<{
  selector: string;
}>;

export function ClientOnlyPortal({ children, selector }: ClientOnlyPortalProps) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector(selector);
    setMounted(true);
  }, [selector]);

  // eslint-disable-next-line react-hooks/refs
  return mounted && ref.current ? createPortal(children, ref.current) : null;
}
