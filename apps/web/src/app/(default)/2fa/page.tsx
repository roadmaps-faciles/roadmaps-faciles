import { redirect } from "next/navigation";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/next-auth/auth";

import { TwoFactorVerify } from "./TwoFactorVerify";

const TwoFactorPage = async () => {
  await connection();
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

  return <TwoFactorVerify hasPasskey={hasPasskey} hasOtp={hasOtp} hasEmail={hasEmail} />;
};

export default TwoFactorPage;
