import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { OAuthButtons } from "@/app/[domain]/(default)/login/OAuthButtons";
import { config } from "@/config";
import { getRootOAuthProviders } from "@/lib/utils/rootOAuthProviders";
import { UISeparator } from "@/ui/bridge";

import { PasswordLoginForm } from "./PasswordLoginForm";

const LoginPage = async (_: PageProps<"/login">) => {
  const t = await getTranslations("auth");

  const rootProviders = await getRootOAuthProviders();
  const enabledProviders = Object.entries(rootProviders)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">
          {t("loginTitle", { brandName: config.brand.name })}
        </h2>

        <PasswordLoginForm />

        {enabledProviders.length > 0 && (
          <>
            <UISeparator />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("oauthPrompt")}</p>
              <OAuthButtons providers={enabledProviders} />
            </div>
          </>
        )}

        <UISeparator />
        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            <Link href="/login/passwordless" className="text-primary underline hover:text-primary/80">
              {t("passwordlessLink")}
            </Link>
          </p>
          <p>
            <Link href="/login/espace-membre" className="text-primary underline hover:text-primary/80">
              {t("espaceMembreLink")}
            </Link>
          </p>
        </div>

        <UISeparator />
        <p className="text-center text-sm text-muted-foreground">
          {t("signUpPrompt")}{" "}
          <Link href="/signup" className="font-medium text-primary underline hover:text-primary/80">
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
