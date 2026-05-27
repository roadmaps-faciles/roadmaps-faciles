"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/lib/next-auth/auth";

/**
 * Bridge sign-in server action.
 *
 * Calls signIn with `redirectTo: "/"` - on success NextAuth sets the session
 * cookie then throws NEXT_REDIRECT. We catch the redirect (cookie is already set)
 * and return `{ ok: true }` so the client can do a hard navigation via
 * `window.location.href`, which forces a full page reload to pick up the new session.
 */
export const bridgeSignIn = async (formData: FormData) => {
  const token = formData.get("token") as string;
  const isSignup = formData.get("isSignup") === "1";
  if (!token) {
    return { error: "no-token" as const };
  }

  try {
    await signIn("bridge", { token, isSignup: isSignup ? "1" : undefined, redirectTo: "/" });
    return { ok: true as const };
  } catch (error) {
    // NextAuth sets the session cookie then throws NEXT_REDIRECT - swallow it
    // and let the client handle navigation via window.location.href (hard reload)
    if (isRedirectError(error)) {
      return { ok: true as const };
    }
    if (error instanceof AuthError) {
      return { error: error.type };
    }
    return { error: "unknown" as const };
  }
};
