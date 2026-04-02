import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { config } from "@/config";
import { UISeparator } from "@/ui/bridge";

import { LoginForm } from "../LoginForm";

const PasswordlessLoginPage = async (_: PageProps<"/login/passwordless">) => {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">
          {t("loginTitle", { brandName: config.brand.name })}
        </h2>

        <p className="text-sm text-muted-foreground">{t("loginWithEmail")}</p>
        <LoginForm loginWithEmail />

        <UISeparator />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline hover:text-primary/80">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PasswordlessLoginPage;
