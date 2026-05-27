import { getTranslations } from "next-intl/server";
import crypto from "node:crypto";

import { PasswordLoginForm } from "@/app/(default)/login/PasswordLoginForm";
import { prisma } from "@/lib/db/prisma";
import { tenantDefaultOAuthRepo } from "@/lib/repo";
import { UICard } from "@/ui/bridge";
import { getTheme } from "@/ui/server";

import { DomainPageHOP } from "../DomainPage";
import { BridgeAutoLogin } from "./BridgeAutoLogin";
import { TenantLoginDefault } from "./TenantLoginDefault";
import { TenantLoginDsfr } from "./TenantLoginDsfr";

const TenantLoginPage = DomainPageHOP()(async props => {
  const t = await getTranslations("auth");
  const searchParams = await (props as unknown as { searchParams: Promise<Record<string, string | undefined>> })
    .searchParams;
  const invitationToken = searchParams?.invitation;
  if (invitationToken) {
    // Validate invitation exists (for future use - pre-fill email)
    const tokenDigest = crypto.createHash("sha256").update(invitationToken).digest("hex");
    await prisma.invitation.findFirst({
      where: { tokenDigest, tenantId: props._data.tenant.id, acceptedAt: null },
      select: { email: true },
    });
  }

  const theme = await getTheme(props._data.settings);

  // Handle bridge token - auto sign-in from root session via client component
  const bridgeToken = searchParams?.bridge_token;
  if (bridgeToken) {
    const bridgeContent = <BridgeAutoLogin token={bridgeToken} />;
    if (theme === "Dsfr") {
      return (
        <TenantLoginDsfr title={t("bridgeLoggingInTitle")} oauthPrompt="" providerNames={[]}>
          {bridgeContent}
        </TenantLoginDsfr>
      );
    }
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <UICard title={t("bridgeLoggingInTitle")} description={bridgeContent} className="w-full max-w-md" />
      </div>
    );
  }

  const enabledOAuthProviders = await tenantDefaultOAuthRepo.findByTenantId(props._data.tenant.id);
  const providerNames = enabledOAuthProviders.map(p => p.provider);
  const loginForm = <PasswordLoginForm />;

  const commonProps = {
    title: t("tenantLogin", { name: props._data.settings.name }),
    oauthPrompt: t("oauthPrompt"),
    providerNames,
    passwordlessUrl: "/login/passwordless",
    passwordlessLink: t("passwordlessLink"),
    signupUrl: "/signup",
    signupLink: t("signUp"),
  };

  if (theme === "Dsfr") {
    return <TenantLoginDsfr {...commonProps}>{loginForm}</TenantLoginDsfr>;
  }

  return <TenantLoginDefault {...commonProps}>{loginForm}</TenantLoginDefault>;
});

export default TenantLoginPage;
