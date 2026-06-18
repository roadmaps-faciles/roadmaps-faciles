import "server-only";
import { type Session } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/next-auth/auth";

/**
 * Authenticated-area gate used by the (authenticated) layout and the self-host root page:
 * redirect to login, 2FA setup, or 2FA verification as needed. Returns the session once cleared.
 */
export async function redirectIfNotAuthenticated(): Promise<Session> {
  const session = await auth();
  if (!session) redirect("/login");

  const pathname = (await headers()).get("x-pathname") || "";
  // 2FA setup must be checked before verification; skip on the setup page to avoid a loop.
  if (session.twoFactorRequired && !session.user.twoFactorEnabled && !pathname.startsWith("/profile/security")) {
    redirect("/profile/security");
  }
  if (session.twoFactorRequired && !session.twoFactorVerified) {
    redirect("/2fa");
  }

  return session;
}
