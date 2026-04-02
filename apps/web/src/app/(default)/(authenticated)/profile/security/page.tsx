import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/next-auth/auth";

import { PasswordSection } from "./PasswordSection";
import { TwoFactorSettings } from "./TwoFactorSettings";

const SecurityPage = async () => {
  await connection();
  const [session, t] = await Promise.all([auth(), getTranslations("profile.security")]);

  if (!session?.user) return null;

  const userId = session.user.uuid;

  const [user, authenticators] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { emailTwoFactorEnabled: true, otpVerifiedAt: true, passwordHash: true },
    }),
    prisma.authenticator.findMany({
      where: { userId },
      select: { credentialID: true, credentialDeviceType: true, credentialBackedUp: true },
    }),
  ]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-6 text-muted-foreground">{t("description")}</p>
      <div className="max-w-2xl space-y-6">
        <PasswordSection hasPassword={!!user.passwordHash} />
        <TwoFactorSettings
          emailEnabled={user.emailTwoFactorEnabled}
          otpConfigured={!!user.otpVerifiedAt}
          passkeys={authenticators}
        />
      </div>
    </div>
  );
};

export default SecurityPage;
