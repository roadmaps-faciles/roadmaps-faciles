import { getTranslations } from "next-intl/server";

import { espaceMembreClient, getEmUserEmail } from "@/lib/gouv/espaceMembre";
import { auth } from "@/lib/next-auth/auth";
import { userRepo } from "@/lib/repo";

import { ProfileForm } from "../../../../(default)/(authenticated)/profile/ProfileForm";
import { DomainPageHOP } from "../../DomainPage";

const TenantProfilePage = DomainPageHOP()(async () => {
  const [session, t] = await Promise.all([auth(), getTranslations("profile")]);
  const user = await userRepo.findById(session!.user.uuid);

  if (!user) return <></>;

  let emEmail: null | string = null;
  if (user.isBetaGouvMember && user.username) {
    try {
      const member = await espaceMembreClient.member.getByUsername(user.username);
      emEmail = getEmUserEmail(member);
    } catch {
      // EM API indisponible — on continue sans emEmail
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
      <ProfileForm
        variant="tenant"
        user={{
          name: user.name,
          email: user.email,
          notificationsEnabled: user.notificationsEnabled,
          isBetaGouvMember: user.isBetaGouvMember,
          username: user.username,
          emEmail,
        }}
      />
    </div>
  );
});

export default TenantProfilePage;
