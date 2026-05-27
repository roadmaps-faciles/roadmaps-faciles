import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";
import { getCapturedEvents } from "@/lib/ee/tracking-provider/memory/server";

import { AnalyticsDebugView } from "./AnalyticsDebugView";

const AdminAnalyticsDebugPage = async () => {
  if (config.tracking.provider !== "memory") notFound();
  await connection();

  const [t, events] = await Promise.all([
    getTranslations("rootAdmin.analyticsDebug"),
    Promise.resolve(getCapturedEvents()),
  ]);

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <AnalyticsDebugView initialEvents={[...events]} />
    </>
  );
};

export default AdminAnalyticsDebugPage;
