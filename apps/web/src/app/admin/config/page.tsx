import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { config } from "@/config";

import { type ConfigEntry, type ConfigSection, flattenConfig } from "./configUtils";
import { ConfigView } from "./ConfigView";

function buildConfigSections(): ConfigSection[] {
  const { _dbUrl, _seeding, seed: _seed, ...safeConfig } = config;

  const allEntries = flattenConfig(safeConfig);

  const sectionMap = new Map<string, ConfigEntry[]>();
  for (const entry of allEntries) {
    const dotIndex = entry.key.indexOf(".");
    const section = dotIndex > 0 ? entry.key.slice(0, dotIndex) : "general";
    const shortKey = dotIndex > 0 ? entry.key.slice(dotIndex + 1) : entry.key;

    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section)!.push({ ...entry, key: shortKey });
  }

  return Array.from(sectionMap.entries()).map(([section, entries]) => ({ section, entries }));
}

const AdminConfigPage = async () => {
  await connection();
  const t = await getTranslations("rootAdmin.config");
  const sections = buildConfigSections();

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ConfigView sections={sections} />
    </>
  );
};

export default AdminConfigPage;
