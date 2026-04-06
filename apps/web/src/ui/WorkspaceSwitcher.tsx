"use client";

import {
  Badge,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@roadmaps-faciles/ui";
import { useIsMobile } from "@roadmaps-faciles/ui/lib/use-mobile";
import { Building2, Check, ExternalLink, LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { type SwitcherItem, type UserMenuData } from "@/ui/AdminSidebar";

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
    observer.observe(container, { attributes: true, subtree: true, attributeFilter: ["data-selected"] });
    update();

    return () => {
      observer.disconnect();
      setHighlight(null);
    };
  }, [container]);

  return highlight;
};

const SwitcherRow = ({
  item,
  navigate,
  t,
  tr,
}: {
  item: SwitcherItem;
  navigate: (href: string) => void;
  t: ReturnType<typeof useTranslations<"sidebar">>;
  tr: ReturnType<typeof useTranslations<"roles">>;
}) => {
  const isAdmin = ADMIN_ROLES.has(item.role);
  const disabled = item.isMember === false;

  return (
    <CommandItem
      value={item.href}
      keywords={[item.name, item.hint ?? ""]}
      disabled={disabled}
      onSelect={() => !disabled && navigate(item.href)}
      className="flex items-center gap-2 bg-transparent! text-inherit!"
    >
      <span className="relative z-10 flex w-full items-center gap-2">
        {item.type === "org" ? (
          <Building2 className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <LayoutDashboard className="size-4 shrink-0 text-muted-foreground" />
        )}
        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
          {item.type === "org" ? t("organization") : t("workspace")}
        </Badge>
        <span className="flex-1 truncate">{item.name}</span>
        {item.hint && <span className="shrink-0 text-[10px] text-muted-foreground">{item.hint}</span>}
        {item.isCurrent && <Check className="size-4 shrink-0 text-primary" />}
        {isAdmin && item.adminHref ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={item.adminHref}
                  className="z-10"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(item.adminHref!);
                  }}
                >
                  <Badge
                    variant="secondary"
                    className="shrink-0 cursor-pointer gap-1 px-1.5 py-0 text-[10px] hover:bg-accent"
                  >
                    {tr(item.role as "OWNER")}
                    <ExternalLink className="size-2.5" />
                  </Badge>
                </a>
              </TooltipTrigger>
              <TooltipContent side="left">{t("tenantAdmin")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : disabled ? (
          <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] text-muted-foreground">
            {t("notRegistered")}
          </Badge>
        ) : (
          <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
            {tr(item.role as "OWNER")}
          </Badge>
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

  const items = userMenu.flatItems ?? [];

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
        {items.map(item => (
          <SwitcherRow key={item.href} item={item} navigate={navigate} t={t} tr={tr} />
        ))}
      </CommandList>
    </CommandDialog>
  );
};
