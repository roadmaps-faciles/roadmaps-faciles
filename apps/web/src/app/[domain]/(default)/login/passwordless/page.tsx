import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/app/(default)/login/LoginForm";
import { getTheme } from "@/ui/server";

import { DomainPageHOP } from "../../DomainPage";
import { TenantLoginDefault } from "../TenantLoginDefault";
import { TenantLoginDsfr } from "../TenantLoginDsfr";

const TenantPasswordlessPage = DomainPageHOP()(async props => {
  const t = await getTranslations("auth");
  const theme = await getTheme(props._data.settings);

  const loginForm = <LoginForm loginWithEmail />;
  const commonProps = {
    title: t("tenantLogin", { name: props._data.settings.name }),
    bridgeUrl: "",
    bridgePrompt: "",
    bridgeLink: "",
    oauthPrompt: "",
    providerNames: [] as string[],
    signupUrl: "/signup",
    signupLink: t("signUp"),
  };

  if (theme === "Dsfr") {
    return <TenantLoginDsfr {...commonProps}>{loginForm}</TenantLoginDsfr>;
  }

  return <TenantLoginDefault {...commonProps}>{loginForm}</TenantLoginDefault>;
});

export default TenantPasswordlessPage;
