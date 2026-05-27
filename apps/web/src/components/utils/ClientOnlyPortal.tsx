"use client";
import { type PropsWithChildren, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ClientOnlyPortalProps = PropsWithChildren<{
  selector: string;
}>;

/**
 * Portal that only renders client-side, once the target element exists in the DOM.
 * The post-mount `setContainer` is intrinsic to portals: `document.querySelector`
 * cannot run during SSR, so a one-shot effect is the only way to look up the node.
 */
export function ClientOnlyPortal({ children, selector }: ClientOnlyPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DOM query is client-only and runs once per selector
    setContainer(document.querySelector(selector));
  }, [selector]);

  return container ? createPortal(children, container) : null;
}
