"use client";

import {
  Building2,
  CreditCard,
  Globe,
  LayoutDashboard,
  Puzzle,
  ScrollText,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { type DevAction, DevToolsPanel } from "@/app/admin/DevToolsPanel";
import { config } from "@/config";
import { AdminSidebar, type NavGroup, type UserMenuData } from "@/ui/AdminSidebar";

import { cleanStripeCustomer } from "./devActions";

interface OrgAdminSideMenuProps {
  isDev: boolean;
  orgName: string;
  orgSlug: string;
  userMenu: UserMenuData;
  useStripe: boolean;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 365}`;
}

export const OrgAdminSideMenu = ({ orgName, orgSlug, userMenu, isDev, useStripe }: OrgAdminSideMenuProps) => {
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
        { label: t("domains"), href: `${base}/domains`, icon: Globe },
        { label: t("addons"), href: `${base}/addons`, icon: Puzzle },
        { label: t("billing"), href: `${base}/billing`, icon: CreditCard },
      ],
    },
    {
      label: t("developers"),
      items: [
        { label: t("security"), href: `${base}/security`, icon: Shield },
        { label: t("auditLog"), href: `${base}/audit-log`, icon: ScrollText },
      ],
    },
  ];

  const devToggles = isDev
    ? [
        {
          id: "useStripe",
          label: "Stripe Checkout",
          description: "Utiliser le vrai flow Stripe",
          defaultValue: useStripe,
          onChangeAction: (value: boolean) => {
            setCookie("dev-use-stripe", value ? "1" : "0");
            window.location.reload();
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
      footer={{ status: t("systemOperational"), version: `v${config.appVersion}` }}
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
