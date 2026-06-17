"use client";

import {
  Badge,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useSidebar,
} from "@roadmaps-faciles/ui";
import {
  ArrowLeft,
  Building2,
  ChevronsUpDown,
  LayoutDashboard,
  Lock,
  LogOut,
  type LucideIcon,
  Monitor,
  Moon,
  PanelLeftClose,
  Repeat,
  Sun,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { UserAvatar } from "@/components/img/UserAvatar";
import { useRovingHighlight } from "@/ui/useRovingHighlight";
import { WorkspaceSwitcher } from "@/ui/WorkspaceSwitcher";

interface SubItem {
  href: string;
  label: string;
}

interface NavItem {
  badge?: number | string;
  href: string;
  icon: LucideIcon;
  label: string;
  /** Premium feature not entitled in the current scope: render a lock marker. */
  locked?: boolean;
  /** Match pathname prefix instead of exact match */
  matchPrefix?: boolean;
  subItems?: SubItem[];
}

export interface NavGroup {
  items: NavItem[];
  label?: string;
}

interface ExtraItem extends NavItem {
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
}

export interface TenantMenuItem {
  href: string;
  id: number;
  isMember: boolean;
  isPrivate: boolean;
  name: string;
  role?: string;
  subdomain: string;
  tenantAdminHref?: string;
}

export interface OrgMenuGroup {
  id: number;
  name: string;
  orgAdminHref?: string;
  role: string;
  slug: string;
  tenants: TenantMenuItem[];
}

export interface CurrentTenantContext {
  adminHref?: string;
  name: string;
  org: {
    adminHref?: string;
    name: string;
  };
}

export interface UserMenuData {
  /** Role of the user in the current admin scope (tenant / org / root), for the sidebar footer. */
  currentRole?: string;
  currentTenant?: CurrentTenantContext;
  currentTenantId?: number;
  /** Global role >= ADMIN (or super admin): can reach /admin. Drives the admin link. */
  isGlobalAdmin?: boolean;
  isSuperAdmin?: boolean;
  organizations: OrgMenuGroup[];
  user: {
    email: string;
    image?: null | string;
    name: string;
  };
}

interface AdminSidebarProps {
  /** Active section ID for IntersectionObserver-based sub-item highlighting */
  activeSection?: null | string;
  /** Link to go back to the main site */
  backHref?: string;
  /** Label for the back link */
  backLabel?: string;
  /** Dev tools panel - only rendered in dev mode */
  devTools?: React.ReactNode;
  /** Extra items shown after a separator below the main nav groups */
  extraItems?: ExtraItem[];
  /** Footer content: system status. Pass `content` for a custom widget, else a static status string. */
  footer?: {
    content?: React.ReactNode;
    status?: string;
    version?: string;
  };
  groups: NavGroup[];
  /** Header icon - ReactNode for full control (e.g. Image, SVG, or Lucide icon) */
  icon: React.ReactNode;
  /** Show background on the icon container (default: true) */
  iconBg?: boolean;
  subtitle?: string;
  title: string;
  /** User menu data for the sidebar footer - PostHog-style with workspace/org/account sections */
  userMenu?: UserMenuData;
}

// --- Dark mode toggle (inline, no i18n needed - icon-only) ---

type Theme = "dark" | "light" | "system";

const CYCLE: Theme[] = ["light", "dark", "system"];
const iconMap: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };
const labelMap: Record<Theme, string> = { light: "Mode clair", dark: "Mode sombre", system: "Système" };

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return "system";
};

const applyTheme = (theme: Theme) => {
  const isDark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme:dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const subscribeTheme = (cb: () => void) => {
  const handler = (e: StorageEvent) => {
    if (e.key === "theme" || e.key === null) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};

const DarkModeToggle = ({ collapsed }: { collapsed?: boolean }) => {
  const theme = useSyncExternalStore<Theme>(subscribeTheme, getStoredTheme, () => "system");

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme:dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const toggle = useCallback(() => {
    const nextIndex = (CYCLE.indexOf(theme) + 1) % CYCLE.length;
    const next = CYCLE[nextIndex];
    if (next === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", next);
    }
    applyTheme(next);
    window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));
  }, [theme]);

  const Icon = iconMap[theme];
  const label = labelMap[theme];

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggle}
              className="flex size-8 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
                >
                  <Icon className="size-4" />
                </motion.span>
              </AnimatePresence>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="inline-flex shrink-0"
        >
          <Icon className="size-4" />
        </motion.span>
      </AnimatePresence>
      <span>{label}</span>
    </button>
  );
};

// --- Sidebar user menu (compact with workspace switcher) ---

const SidebarUserMenu = ({ userMenu }: { userMenu: UserMenuData }) => {
  const t = useTranslations("sidebar");
  const tr = useTranslations("roles");
  const { isMobile, state } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";
  const displayName = userMenu.user.name || userMenu.user.email;
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-auto py-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar name={displayName} image={userMenu.user.image} className="size-8 rounded-lg text-xs" />
              {!collapsed && (
                <>
                  <div className="grid flex-1 text-left text-sm/tight">
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">{userMenu.user.email}</span>
                    {userMenu.currentRole && (
                      <Badge variant="outline" className="mt-1.5 w-fit px-1.5 py-0.5 text-[10px] leading-none">
                        {tr(userMenu.currentRole as "OWNER")}
                      </Badge>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/40" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            className="w-[--radix-dropdown-menu-trigger-width] min-w-72"
          >
            {/* User info header */}
            <DropdownMenuLabel className="flex items-center gap-3 p-3 font-normal">
              <UserAvatar name={displayName} image={userMenu.user.image} className="size-9 rounded-lg text-xs" />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{displayName}</span>
                <span className="text-xs text-muted-foreground">{userMenu.user.email}</span>
              </div>
            </DropdownMenuLabel>

            {/* Current tenant context */}
            {userMenu.currentTenant && (
              <>
                <DropdownMenuSeparator />
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-semibold">{userMenu.currentTenant.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 pl-6">
                    <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs text-muted-foreground">{userMenu.currentTenant.org.name}</span>
                  </div>
                  {(userMenu.currentTenant.adminHref || userMenu.currentTenant.org.adminHref) && (
                    <div className="mt-1.5 flex gap-3 pl-6">
                      {userMenu.currentTenant.adminHref && (
                        <Link href={userMenu.currentTenant.adminHref} className="text-xs text-primary hover:underline">
                          {t("tenantAdmin")}
                        </Link>
                      )}
                      {userMenu.currentTenant.org.adminHref && (
                        <Link
                          href={userMenu.currentTenant.org.adminHref}
                          className="text-xs text-primary hover:underline"
                        >
                          {t("orgAdmin")}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Switch workspace + admin */}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {userMenu.organizations.length > 0 && (
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3"
                  onSelect={e => {
                    e.preventDefault();
                    setSwitcherOpen(true);
                  }}
                >
                  <Repeat className="size-4 shrink-0 text-muted-foreground" />
                  <span>{t("switchWorkspace")}</span>
                  <kbd className="ml-auto rounded-sm border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    ⌘K
                  </kbd>
                </DropdownMenuItem>
              )}

              {userMenu.isGlobalAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2 px-3">
                    <Monitor className="size-4 shrink-0 text-muted-foreground" />
                    <span>{t("administration")}</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            {/* Account section */}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 px-3">
                  <User className="size-4 shrink-0" />
                  <span>{t("profile")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 px-3"
                onSelect={() => void signOut({ redirectTo: "/" })}
              >
                <LogOut className="size-4 shrink-0" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <WorkspaceSwitcher userMenu={userMenu} open={switcherOpen} onOpenChangeAction={setSwitcherOpen} />
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

// Override sidebar button hover to let our roving highlight handle it
const sidebarItemStyle = { backgroundColor: "transparent" } as const;

/**
 * Shared admin sidebar - root and tenant admin layouts.
 *
 * Matches Stitch wireframe: icon + app name header, labeled groups,
 * separated extra items (moderation), status footer.
 */
export const AdminSidebar = ({
  title,
  subtitle,
  icon,
  iconBg = true,
  groups,
  activeSection,
  extraItems,
  devTools,
  footer,
  backHref,
  backLabel,
  userMenu,
}: AdminSidebarProps) => {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { clearHighlight, handleItemHover, highlight } = useRovingHighlight('[data-slot="sidebar-content"]');

  const isItemActive = (item: NavItem) => {
    if (item.matchPrefix) return pathname.startsWith(item.href);
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const isSubItemActive = (subItem: SubItem, parentItem: NavItem) => {
    if (subItem.href.includes("#")) {
      const sectionId = subItem.href.split("#")[1];
      return isItemActive(parentItem) && activeSection === sectionId;
    }
    return pathname === subItem.href;
  };

  const renderItem = (item: NavItem, badgeVariant?: "default" | "destructive" | "outline" | "secondary") => {
    const active = isItemActive(item);
    const Icon = item.icon;

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.label}
          style={active ? undefined : sidebarItemStyle}
          onMouseEnter={isMobile ? undefined : handleItemHover}
          onMouseLeave={isMobile ? undefined : clearHighlight}
        >
          <Link href={item.href}>
            <Icon className="size-5" />
            <span>{item.label}</span>
            {item.locked && <Lock className="ml-auto size-3.5 shrink-0 text-sidebar-foreground/40" />}
          </Link>
        </SidebarMenuButton>
        {item.badge != null && (
          <SidebarMenuBadge>
            <Badge
              variant={badgeVariant ?? "destructive"}
              className="size-5 justify-center rounded-full p-0 text-[10px]"
            >
              {item.badge}
            </Badge>
          </SidebarMenuBadge>
        )}
        {item.subItems && active && (
          <SidebarMenuSub>
            {item.subItems.map(sub => (
              <SidebarMenuSubItem key={sub.href}>
                <SidebarMenuSubButton asChild isActive={isSubItemActive(sub, item)}>
                  <Link href={sub.href}>{sub.label}</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Header: app icon + name + collapse trigger */}
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-0">
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg transition-all",
                "size-9 group-data-[collapsible=icon]:size-8",
                iconBg
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "border border-sidebar-border text-sidebar-foreground",
              )}
            >
              {icon}
            </div>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm/tight font-bold">{title}</span>
              {subtitle && (
                <span className="truncate text-[10px] font-medium text-sidebar-foreground/50">{subtitle}</span>
              )}
            </div>
          </div>
          {/* Collapse trigger - right of title when expanded, below logo when collapsed */}
          <SidebarTrigger className="size-7 shrink-0 text-sidebar-foreground/40 hover:text-sidebar-foreground">
            <PanelLeftClose className="size-4 transition-transform group-data-[collapsible=icon]:rotate-180" />
          </SidebarTrigger>
        </div>
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            <span className="truncate group-data-[collapsible=icon]:hidden">{backLabel}</span>
          </Link>
        )}
      </SidebarHeader>

      {/* Nav groups */}
      <SidebarContent className="relative" onMouseLeave={isMobile ? undefined : clearHighlight}>
        {/* Roving highlight - disabled on mobile (touch has no hover, Sheet transform offsets positions) */}
        {!isMobile && highlight && (
          <motion.div
            className="pointer-events-none absolute inset-x-2 top-0 z-0 rounded-md bg-sidebar-accent"
            initial={false}
            animate={{ y: highlight.y, height: highlight.height }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
          />
        )}

        {groups.map((group, gi) => (
          <SidebarGroup key={gi} className={cn(gi > 0 && "pt-4", "group-data-[collapsible=icon]:px-1.5")}>
            {group.label && (
              <SidebarGroupLabel className="mb-1 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>{group.items.map(item => renderItem(item))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Extra items (e.g. Moderation) separated by a divider */}
        {extraItems && extraItems.length > 0 && (
          <>
            <SidebarSeparator className="mx-0! my-2" />
            <SidebarGroup className="group-data-[collapsible=icon]:px-1.5">
              <SidebarGroupContent>
                <SidebarMenu>{extraItems.map(item => renderItem(item, item.badgeVariant))}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer: dark mode + system status + user menu */}
      <SidebarFooter className="mt-auto gap-1 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        {/* Dark mode toggle */}
        <div className="group-data-[collapsible=icon]:hidden">
          <DarkModeToggle />
        </div>
        <div className="hidden group-data-[collapsible=icon]:block">
          <DarkModeToggle collapsed />
        </div>

        {/* System status */}
        {footer?.content
          ? footer.content
          : footer && (
              <>
                <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-2.5 group-data-[collapsible=icon]:hidden">
                  <div className="mb-0.5 flex items-center gap-2">
                    <div className="size-2 animate-pulse rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-sidebar-foreground/70">
                      {footer.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-sidebar-foreground/50">{footer.version}</p>
                </div>
                {/* Collapsed: just the green dot with tooltip */}
                <div className="hidden group-data-[collapsible=icon]:block">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center py-1">
                          <div className="size-2 animate-pulse rounded-full bg-green-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs">
                          {footer.status} - {footer.version}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </>
            )}

        {/* Dev tools (dev mode only) */}
        {devTools && <div className="group-data-[collapsible=icon]:hidden">{devTools}</div>}

        {/* User menu */}
        {userMenu && <SidebarUserMenu userMenu={userMenu} />}
      </SidebarFooter>
    </Sidebar>
  );
};
