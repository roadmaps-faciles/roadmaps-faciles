import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { sharedMetadata } from "../../../shared-metadata";

const title = "Statistiques d'utilisation";
const description = "Statistiques d'utilisation de la plateforme";
const url = "/stats";

export const metadata: Metadata = {
  ...sharedMetadata,
  title,
  description,
  openGraph: {
    ...sharedMetadata.openGraph,
    title,
    description,
    url,
  },
  alternates: {
    canonical: url,
  },
};

const Stats = async () => {
  const t = await getTranslations("stats");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
      {/* <StatsContent /> */}
    </div>
  );
};

export default Stats;
