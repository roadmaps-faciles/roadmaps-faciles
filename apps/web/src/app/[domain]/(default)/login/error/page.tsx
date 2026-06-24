import { getTranslations } from "next-intl/server";

import { UIButton, UICard } from "@/ui/bridge";

import { DomainPageHOP } from "../../DomainPage";

// NextAuth redirige ici (pages.error = "/login/error") sur un host tenant. La version root
// redirige vers /error, qui n'existe pas en contexte tenant : on rend donc le message d'auth
// refusée directement, thémé via les bridges (UICard/UIButton suivent le thème du tenant).
const TenantLoginErrorPage = DomainPageHOP()(async () => {
  const t = await getTranslations("errors");
  const ta = await getTranslations("auth");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <UICard
        className="w-full max-w-md"
        title={t("401.title")}
        description={
          <>
            {t("401.headline")}
            <br />
            {t("401.body")}
          </>
        }
        footer={<UIButton linkProps={{ href: "/login" }}>{ta("signIn")}</UIButton>}
      />
    </div>
  );
});

export default TenantLoginErrorPage;
