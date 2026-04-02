"use client";

import { type SuspenseProps, useEffect, useState } from "react";

export const ClientOnly = ({ children, fallback }: SuspenseProps) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);
  return hasMounted;
}
