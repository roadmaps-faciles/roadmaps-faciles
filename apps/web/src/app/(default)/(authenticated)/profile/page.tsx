import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { auth } from "@/lib/next-auth/auth";
import { userRepo } from "@/lib/repo";
import { UIButton, UISeparator } from "@/ui/bridge";

import { ProfileForm } from "./ProfileForm";

const ProfilePage = async () => {
  await connection();
  const [session, t] = await Promise.all([auth(), getTranslations("profile")]);
  const user = await userRepo.findById(session!.user.uuid);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
      <div className="max-w-xl">
        <ProfileForm
          variant="root"
          user={{
            name: user.name,
            email: user.email,
            notificationsEnabled: user.notificationsEnabled,
            isBetaGouvMember: user.isBetaGouvMember,
            username: user.username,
            emEmail: null,
          }}
        />
      </div>
      <UISeparator className="my-8" />
      <h2 className="mb-2 text-xl font-semibold">{t("securityTitle")}</h2>
      <p className="mb-4 text-muted-foreground">{t("securityDescription")}</p>
      <UIButton variant="outline" linkProps={{ href: "/profile/security" }}>
        {t("securityLink")}
      </UIButton>
    </div>
  );
};

export default ProfilePage;
