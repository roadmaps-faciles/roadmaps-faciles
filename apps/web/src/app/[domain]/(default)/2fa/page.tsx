import { redirect } from "next/navigation";

import { TwoFactorVerify } from "@/app/(default)/2fa/TwoFactorVerify";
import { DsfrPage } from "@/gouv/dsfr/layout/DsfrPage";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/next-auth/auth";

import { DomainPageHOP } from "../DomainPage";

const TenantTwoFactorPage = DomainPageHOP()(async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.twoFactorVerified) {
    redirect("/");
  }

  const userId = session.user.uuid;

  const [user, authenticators] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { emailTwoFactorEnabled: true, otpVerifiedAt: true },
    }),
    prisma.authenticator.findMany({
      where: { userId },
      select: { credentialID: true },
    }),
  ]);

  const hasPasskey = authenticators.length > 0;
  const hasOtp = !!user?.otpVerifiedAt;
  const hasEmail = !!user?.emailTwoFactorEnabled;

  return (
    <DsfrPage>
      <TwoFactorVerify hasPasskey={hasPasskey} hasOtp={hasOtp} hasEmail={hasEmail} />
    </DsfrPage>
  );
});

export default TenantTwoFactorPage;
