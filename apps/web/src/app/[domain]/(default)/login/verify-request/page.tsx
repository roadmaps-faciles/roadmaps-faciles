import { getTranslations } from "next-intl/server";

import { config } from "@/config";
import { UICard } from "@/ui/bridge";

import { DomainPageHOP } from "../../DomainPage";

const TenantVerifyRequestPage = DomainPageHOP()(async () => {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <UICard
        className="w-full max-w-md"
        title={t("emailSentTitle", { brandName: config.brand.name })}
        description={
          <>
            {t("emailSentHeadline")}
            <br />
            {t("emailSentBody")}
            <br />
            {t("emailSentSpam")}
          </>
        }
      />
    </div>
  );
});

export default TenantVerifyRequestPage;
