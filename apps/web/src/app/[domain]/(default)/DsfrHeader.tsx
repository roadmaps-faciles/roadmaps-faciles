import Header from "@codegouvfr/react-dsfr/Header";

import { Brand } from "@/components/Brand";
import { type Board, type TenantSettings } from "@/prisma/client";
import { type UserMenuData } from "@/ui/AdminSidebar";
import { UIThemeDevToggle } from "@/ui/UIThemeDevToggle";

import { UserHeaderItem } from "../../AuthHeaderItems";
import { LanguageSelectClient } from "../../LanguageSelectClient";
import { DomainNavigation } from "./DomainNavigation";

interface DsfrHeaderProps {
  boards: Board[];
  homeHref: string;
  pendingModerationCount: number;
  // Token de vérification de domaine exclu : header public, jamais dans le payload client.
  tenantSettings: Omit<TenantSettings, "customDomainVerificationToken">;
  userMenu?: UserMenuData;
}

export const DsfrHeader = ({ boards, homeHref, pendingModerationCount, tenantSettings, userMenu }: DsfrHeaderProps) => (
  <Header
    navigation={<DomainNavigation boards={boards} tenantSettings={tenantSettings} />}
    brandTop={<Brand />}
    homeLinkProps={{ href: homeHref, title: tenantSettings.name }}
    serviceTitle={tenantSettings.name}
    quickAccessItems={[
      <UIThemeDevToggle key="hqai-theme-dev" />,
      <LanguageSelectClient key="hqai-lang" />,
      <UserHeaderItem key="hqai-user" pendingModerationCount={pendingModerationCount} userMenu={userMenu} />,
    ]}
  />
);
