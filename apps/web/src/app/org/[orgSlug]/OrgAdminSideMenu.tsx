"use client";

import { Building2, CreditCard, LayoutDashboard, Puzzle, ScrollText, Settings, Shield, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { toggleStripeCheckoutDevAction } from "@/app/admin/dev-tools/actions";
import { type DevAction, DevToolsPanel } from "@/app/admin/DevToolsPanel";
import { config } from "@/config";
import { AdminSidebar, type NavGroup, type UserMenuData } from "@/ui/AdminSidebar";
import { SystemStatusWidget } from "@/ui/SystemStatusWidget";

import { cleanStripeCustomer } from "./devActions";

interface OrgAdminSideMenuProps {
  isDev: boolean;
  orgName: string;
  orgSlug: string;
  /** Self-host: billing/addons (cloud) are hidden, plus security (stub). */
  selfHost: boolean;
  userMenu: UserMenuData;
  useStripe: boolean;
}

export const OrgAdminSideMenu = ({ orgName, orgSlug, userMenu, isDev, useStripe, selfHost }: OrgAdminSideMenuProps) => {
  const t = useTranslations("orgAdmin.sideMenu");
  const base = `/org/${orgSlug}`;

  const groups: NavGroup[] = [
    {
      label: t("configuration"),
      items: [
        { label: t("general"), href: `${base}/general`, icon: Settings },
        { label: t("tenants"), href: `${base}/tenants`, icon: LayoutDashboard },
        { label: t("members"), href: `${base}/members`, icon: Users },
      ],
    },
    {
      label: t("management"),
      items: [
        // Domaines org désactivés (feature dormante, réveil futur façon "org domains" GitHub).
        // La preuve de propriété d'un customDomain se fait désormais au niveau tenant (TXT).
        ...(selfHost
          ? []
          : [
              { label: t("addons"), href: `${base}/addons`, icon: Puzzle },
              { label: t("billing"), href: `${base}/billing`, icon: CreditCard },
            ]),
      ],
    },
    {
      label: t("developers"),
      items: [
        ...(selfHost ? [] : [{ label: t("security"), href: `${base}/security`, icon: Shield }]),
        { label: t("auditLog"), href: `${base}/audit-log`, icon: ScrollText },
      ],
    },
  ].filter(group => group.items.length > 0);

  const devToggles = isDev
    ? [
        {
          id: "useStripe",
          label: "Stripe Checkout",
          description: "Utiliser le vrai flow Stripe",
          defaultValue: useStripe,
          onChangeAction: (value: boolean) => {
            void toggleStripeCheckoutDevAction(value).then(() => window.location.reload());
          },
        },
      ]
    : [];

  return (
    <AdminSidebar
      title={orgName}
      subtitle={t("organization")}
      icon={<Building2 className="size-5" />}
      iconBg
      groups={groups}
      backHref="/"
      backLabel={t("backToSite")}
      footer={{ content: <SystemStatusWidget version={`v${config.appVersion}`} /> }}
      devTools={
        isDev ? (
          <DevToolsPanel
            toggles={devToggles}
            actions={[
              {
                id: "cleanStripe",
                label: "Clean Stripe",
                description: "Annule les abos, désactive les addons",
                variant: "destructive",
                onClickAction: () => cleanStripeCustomer(orgSlug),
              } satisfies DevAction,
            ]}
          />
        ) : undefined
      }
      userMenu={userMenu}
    />
  );
};
