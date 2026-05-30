import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { config } from "@/config";
import { UISeparator } from "@/ui/bridge";

import { LoginForm } from "../LoginForm";
import { withCallbackUrl } from "../loginHrefs";

const EspaceMembreLoginPage = async (props: PageProps<"/login/espace-membre">) => {
  const t = await getTranslations("auth");
  const searchParams = await props.searchParams;
  const callbackUrl = typeof searchParams.callbackUrl === "string" ? searchParams.callbackUrl : undefined;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">
          {t("loginTitle", { brandName: config.brand.name })}
        </h2>

        <p className="text-sm text-muted-foreground">{t("loginWithUsername")}</p>
        <LoginForm />

        <UISeparator />
        <p className="text-center text-sm text-muted-foreground">
          <Link href={withCallbackUrl("/login", callbackUrl)} className="text-primary underline hover:text-primary/80">
            {t("loginWithEmail")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EspaceMembreLoginPage;
