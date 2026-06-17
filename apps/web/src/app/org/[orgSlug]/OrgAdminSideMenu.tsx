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
import { SystemStatusWidget } from "@/ui/SystemStatusWidget";

import { cleanStripeCustomer } from "./devActions";

interface OrgAdminSideMenuProps {
  isDev: boolean;
  /** Self-host with a valid license: domains stays available (gov needs a .gouv.fr custom domain). */
  licensed: boolean;
  orgName: string;
  orgSlug: string;
  /** Self-host: billing/addons (cloud) are hidden, plus security (stub) and domains in community. */
  selfHost: boolean;
  userMenu: UserMenuData;
  useStripe: boolean;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${60 * 60 * 24 * 365}`;
}

export const OrgAdminSideMenu = ({
  orgName,
  orgSlug,
  userMenu,
  isDev,
  useStripe,
  selfHost,
  licensed,
}: OrgAdminSideMenuProps) => {
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
        ...(selfHost && !licensed ? [] : [{ label: t("domains"), href: `${base}/domains`, icon: Globe }]),
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
