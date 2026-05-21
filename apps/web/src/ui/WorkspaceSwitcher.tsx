"use client";

import {
  Badge,
  cn,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@roadmaps-faciles/ui";
import { useIsMobile } from "@roadmaps-faciles/ui/lib/use-mobile";
import { Building2, Check, LayoutDashboard, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { type UserMenuData } from "@/ui/AdminSidebar";

export interface WorkspaceSwitcherProps {
  onOpenChangeAction?: (open: boolean) => void;
  open?: boolean;
  userMenu: UserMenuData;
}

const ADMIN_ROLES = new Set(["ADMIN", "OWNER"]);

interface HighlightRect {
  height: number;
  y: number;
}

const useCmdkHighlight = (container: HTMLDivElement | null) => {
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);

  useEffect(() => {
    if (!container) return;

    const update = () => {
      const selected = container.querySelector<HTMLElement>('[data-selected="true"]');
      if (!selected) {
        setHighlight(null);
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const itemRect = selected.getBoundingClientRect();
      setHighlight({ y: itemRect.top - containerRect.top + container.scrollTop, height: itemRect.height });
    };

    const observer = new MutationObserver(update);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ["data-selected"],
      childList: true,
      subtree: true,
    });
    update();

    return () => {
      observer.disconnect();
      setHighlight(null);
    };
  }, [container]);

  return highlight;
};

interface RowProps {
  adminHref?: string;
  disabled?: boolean;
  hint: string;
  href: string;
  isCurrent?: boolean;
  keywords: string[];
  name: string;
  navigate: (href: string) => void;
  role: string;
  showAdmin: boolean;
  showRole: boolean;
  t: ReturnType<typeof useTranslations<"sidebar">>;
  tr: ReturnType<typeof useTranslations<"roles">>;
  type: "org" | "tenant";
}

const SwitcherRow = ({
  adminHref,
  disabled = false,
  href,
  hint,
  isCurrent = false,
  keywords,
  name,
  navigate,
  role,
  showAdmin,
  showRole,
  t,
  tr,
  type,
}: RowProps) => {
  return (
    <CommandItem
      value={href}
      keywords={keywords}
      disabled={disabled}
      onSelect={() => !disabled && navigate(href)}
      className={cn("flex items-center gap-2 bg-transparent! text-inherit!", isCurrent && "border-l-2 border-primary")}
    >
      <span className="relative z-10 flex w-full items-center gap-2">
        {type === "org" ? (
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <LayoutDashboard className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className={cn("truncate text-sm", isCurrent && "font-medium")}>{name}</span>
          <span className="truncate text-[11px] text-muted-foreground">{hint}</span>
        </span>
        {isCurrent && <Check className="size-4 shrink-0 text-primary" />}
        {disabled ? (
          <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] text-muted-foreground">
            {t("notRegistered")}
          </Badge>
        ) : showRole ? (
          <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
            {tr(role as "OWNER")}
          </Badge>
        ) : null}
        {!disabled && showAdmin && adminHref && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={adminHref}
                  aria-label={type === "org" ? t("orgAdmin") : t("tenantAdmin")}
                  className="z-10 inline-flex shrink-0 items-center justify-center rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(adminHref);
                  }}
                >
                  <Settings className="size-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="left">{type === "org" ? t("orgAdmin") : t("tenantAdmin")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
    </CommandItem>
  );
};

export const WorkspaceSwitcher = ({ userMenu, open: controlledOpen, onOpenChangeAction }: WorkspaceSwitcherProps) => {
  const t = useTranslations("sidebar");
  const tr = useTranslations("roles");
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback((v: boolean) => (onOpenChangeAction ?? setInternalOpen)(v), [onOpenChangeAction]);
  const [listNode, setListNode] = useState<HTMLDivElement | null>(null);
  const highlight = useCmdkHighlight(listNode);

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === "KeyK" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    const customHandler = () => setOpen(true);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("open-workspace-switcher", customHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("open-workspace-switcher", customHandler);
    };
  }, [open, setOpen]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      window.location.href = href;
    },
    [setOpen],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("switchWorkspace")}
      description={t("searchWorkspace")}
      onOpenAutoFocus={isMobile ? e => e.preventDefault() : undefined}
    >
      <CommandInput placeholder={t("searchWorkspace")} />
      <CommandList ref={setListNode} className="relative">
        {highlight && (
          <motion.div
            className="pointer-events-none absolute inset-x-1 z-0 rounded-sm bg-accent"
            initial={false}
            animate={{ y: highlight.y, height: highlight.height }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
          />
        )}
        <CommandEmpty>{t("noResults")}</CommandEmpty>
        {userMenu.organizations.map(org => {
          const orgIsAdmin = ADMIN_ROLES.has(org.role);
          const showOrgRow = orgIsAdmin && Boolean(org.orgAdminHref);
          return (
            <CommandGroup key={org.id} heading={org.name}>
              {showOrgRow && org.orgAdminHref && (
                <SwitcherRow
                  type="org"
                  name={org.name}
                  hint={org.slug}
                  href={org.orgAdminHref}
                  role={org.role}
                  showRole={false}
                  showAdmin={false}
                  keywords={[org.name, org.slug]}
                  navigate={navigate}
                  t={t}
                  tr={tr}
                />
              )}
              {org.tenants.map(tenant => {
                const role = tenant.role ?? "MEMBER";
                const isAdmin = ADMIN_ROLES.has(role);
                const slugPath = `${org.slug}/${tenant.subdomain}`;
                return (
                  <SwitcherRow
                    key={tenant.href}
                    type="tenant"
                    name={tenant.name}
                    hint={slugPath}
                    href={tenant.href}
                    adminHref={tenant.tenantAdminHref}
                    role={role}
                    isCurrent={tenant.id === userMenu.currentTenantId}
                    disabled={!tenant.isMember}
                    showRole={role !== "OWNER"}
                    showAdmin={isAdmin && Boolean(tenant.tenantAdminHref)}
                    keywords={[tenant.name, slugPath, tenant.subdomain, org.name, org.slug]}
                    navigate={navigate}
                    t={t}
                    tr={tr}
                  />
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
      <div className="flex items-center gap-4 border-t px-3 py-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <kbd className="rounded-sm border bg-muted px-1 font-mono text-[10px]">↑↓</kbd>
          {t("hintNavigate")}
        </span>
        <span className="inline-flex items-center gap-1">
          <kbd className="rounded-sm border bg-muted px-1 font-mono text-[10px]">↵</kbd>
          {t("hintOpen")}
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          <kbd className="rounded-sm border bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
          {t("hintClose")}
        </span>
      </div>
    </CommandDialog>
  );
};
