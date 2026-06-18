import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StatusBoard } from "./StatusBoard";

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("systemStatus");
  return { title: t("pageTitle"), description: t("pageSubtitle") };
};

const StatusPage = () => <StatusBoard />;

export default StatusPage;
