import { useEffect, useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
};

const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT;

const getServerSnapshot = () => false;

export function useIsMobile() {
  // Force a re-render after hydration to sync with actual viewport
  useEffect(() => {}, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
