import { Card } from "@roadmaps-faciles/ui";
import { getTranslations } from "next-intl/server";

interface GouvCalloutProps {
  contactEmail: string;
}

export const GouvCallout = async ({ contactEmail }: GouvCalloutProps) => {
  const t = await getTranslations("pricing");

  return (
    <Card className="border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950 sm:p-8">
      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
        <div className="mb-4 text-4xl sm:mb-0 sm:mr-6">🇫🇷</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">{t("gouv.title")}</h2>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">{t("gouv.description")}</p>
          <ul className="mt-3 space-y-1 text-sm text-blue-700 dark:text-blue-300">
            <li>✓ {t("gouv.allAddons")}</li>
            <li>✓ {t("gouv.dsfr")}</li>
            <li>✓ {t("gouv.unlimitedTenants")}</li>
            <li>✓ {t("gouv.gouvDomain")}</li>
          </ul>
        </div>
        <div className="mt-4 sm:ml-6 sm:mt-0">
          <a
            href={`mailto:${contactEmail}`}
            className="inline-block rounded-md bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
          >
            {t("cta.contact")}
          </a>
        </div>
      </div>
    </Card>
  );
};
