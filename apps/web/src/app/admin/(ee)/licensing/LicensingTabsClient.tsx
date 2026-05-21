"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { LicensingManagementView } from "./LicensingManagementView";

interface Props {
  statusContent: ReactNode;
}

export const LicensingTabsClient = ({ statusContent }: Props) => {
  const t = useTranslations("rootAdmin.licensing.tabs");
  const [tab, setTab] = useState("management");

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="management">{t("management")}</TabsTrigger>
        <TabsTrigger value="status">{t("status")}</TabsTrigger>
      </TabsList>
      <TabsContent value="management" className="mt-6">
        <LicensingManagementView />
      </TabsContent>
      <TabsContent value="status" className="mt-6">
        {statusContent}
      </TabsContent>
    </Tabs>
  );
};
