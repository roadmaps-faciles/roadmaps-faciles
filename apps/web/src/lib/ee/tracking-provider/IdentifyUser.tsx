"use client";

import * as Sentry from "@sentry/nextjs";
import { useSession } from "next-auth/react";
import { Component, type ErrorInfo, type ReactNode, useEffect, useRef } from "react";

import { useTracking } from "./TrackingContext";

/**
 * Error boundary that silences SessionProvider missing errors.
 * This can happen during Turbopack dev prerender edge cases.
 */
class IdentifyUserBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  public state = { hasError: false };
  public static getDerivedStateFromError() {
    return { hasError: true };
  }
  public componentDidCatch(error: Error, _info: ErrorInfo) {
    if (error.message.includes("useSession")) return; // Expected edge case
    console.error(error);
  }
  public render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/**
 * Syncs the authenticated user identity to both Sentry and the tracking provider.
 * Renders nothing - side-effect only.
 *
 * Place inside `TrackingProvider` and `SessionProvider`.
 */
export function IdentifyUser() {
  return (
    <IdentifyUserBoundary>
      <IdentifyUserInner />
    </IdentifyUserBoundary>
  );
}

function IdentifyUserInner() {
  const { data: session, status } = useSession();
  const tracking = useTracking();
  const identifiedRef = useRef<null | string>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      const user = session.user;
      const userId = user.id;

      if (!userId || identifiedRef.current === userId) return;

      Sentry.setUser({
        id: userId,
        username: user.name ?? undefined,
        email: user.email ?? undefined,
      });

      tracking.identify(userId, {
        name: user.name ?? undefined,
        email: user.email ?? undefined,
        role: user.role ?? undefined,
      });

      if (user.currentTenantRole) {
        tracking.group("tenant", userId, {
          role: user.currentTenantRole,
        });
      }

      identifiedRef.current = userId;
    }

    if (status === "unauthenticated" && identifiedRef.current) {
      Sentry.setUser(null);
      tracking.reset();
      identifiedRef.current = null;
    }
  }, [status, session, tracking]);

  return null;
}
