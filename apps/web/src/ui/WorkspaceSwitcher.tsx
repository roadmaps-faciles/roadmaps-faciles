"use client";

import {
  Badge,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@roadmaps-faciles/ui";
import { Building2, Check, LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { type UserMenuData } from "@/ui/AdminSidebar";

export interface WorkspaceSwitcherProps {
  onOpenChangeAction?: (open: boolean) => void;
  open?: boolean;
  userMenu: UserMenuData;
}

export const WorkspaceSwitcher = ({ userMenu, open: controlledOpen, onOpenChangeAction }: WorkspaceSwitcherProps) => {
  const t = useTranslations("sidebar");
  const tr = useTranslations("roles");
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback((v: boolean) => (onOpenChangeAction ?? setInternalOpen)(v), [onOpenChangeAction]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      // Cross-subdomain navigation requires full page load (router.push can't cross origins)
      window.location.href = href;
    },
    [setOpen],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title={t("switchWorkspace")} description={t("searchWorkspace")}>
      <CommandInput placeholder={t("searchWorkspace")} />
      <CommandList>
        <CommandEmpty>{t("noResults")}</CommandEmpty>
        {userMenu.organizations.map((org, i) => (
          <div key={org.id}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={org.name}>
              {org.orgAdminHref && (
                <CommandItem onSelect={() => navigate(org.orgAdminHref!)}>
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{org.name}</span>
                  <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                    {tr(org.role as "OWNER")}
                  </Badge>
                </CommandItem>
              )}
              {org.tenants.map(tenant => (
                <CommandItem
                  key={tenant.id}
                  disabled={!tenant.isMember}
                  onSelect={() => tenant.isMember && navigate(tenant.href)}
                  className={!tenant.isMember ? "opacity-50" : undefined}
                >
                  <LayoutDashboard className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{tenant.name}</span>
                  {tenant.id === userMenu.currentTenantId && <Check className="size-4 text-primary" />}
                  {tenant.isMember ? (
                    <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                      {tr((tenant.role ?? "MEMBER") as "OWNER")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] text-muted-foreground">
                      {t("notRegistered")}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
