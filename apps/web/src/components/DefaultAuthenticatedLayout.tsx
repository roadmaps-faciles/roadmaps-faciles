import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/next-auth/auth";

export const DefaultAuthenticatedLayout = async ({ children }: LayoutProps<"/">) => {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Redirect to 2FA setup if force 2FA is active but user has no 2FA methods (must be checked BEFORE verification)
  // Skip redirect if already on the security setup page to avoid infinite loops
  if (session.twoFactorRequired && !session.user.twoFactorEnabled && !pathname.startsWith("/profile/security")) {
    redirect("/profile/security");
  }

  // Redirect to 2FA verification if required but not yet verified
  if (session.twoFactorRequired && !session.twoFactorVerified) {
    redirect("/2fa");
  }

  return children;
};
