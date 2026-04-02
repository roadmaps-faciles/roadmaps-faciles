import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { config } from "@/config";

const VerifyRequestPage = async () => {
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
          <Mail className="size-10 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">{t("emailSentTitle", { brandName: config.brand.name })}</h1>
        <p className="mb-4 text-lg text-muted-foreground">{t("emailSentHeadline")}</p>
        <div className="text-sm text-muted-foreground">
          <p>{t("emailSentBody")}</p>
          <p>{t("emailSentSpam")}</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyRequestPage;
