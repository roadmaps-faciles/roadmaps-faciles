import { getTranslations } from "next-intl/server";

import { DomainPageHOP } from "../DomainPage";
import { TenantSignupForm } from "./TenantSignupForm";

const TenantSignupPage = DomainPageHOP()(async props => {
  const t = await getTranslations("auth");
  const { settings } = props._data;

  // Block signup if registration is disabled
  if (settings.emailRegistrationPolicy === "NOONE") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6 text-center text-card-foreground shadow-sm">
          <h2 className="text-2xl font-semibold">{t("signupTitle", { brandName: settings.name })}</h2>
          <p className="text-muted-foreground">{t("registrationDisabled")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">
          {t("signupTitle", { brandName: settings.name })}
        </h2>
        <TenantSignupForm />
      </div>
    </div>
  );
});

export default TenantSignupPage;
