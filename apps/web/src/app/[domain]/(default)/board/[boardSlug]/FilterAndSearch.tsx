"use client";

import { Button, Input, SegmentedControl, SegmentedControlItem } from "@roadmaps-faciles/ui";
import { Filter, LayoutGrid, List, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { lazy, Suspense, useState } from "react";

import { useUI } from "@/ui";

import { defaultOrder, defaultView, type Order, ORDER_OPTIONS, type View } from "./types";

const FilterAndSearchDsfr = lazy(() => import("./FilterAndSearchDsfr").then(m => ({ default: m.FilterAndSearchDsfr })));

export interface FilterAndSearchProps {
  order: Order;
  search?: string;
  view: View;
}

export const FilterAndSearch = ({ order, search, view }: FilterAndSearchProps) => {
  const theme = useUI();

  if (theme === "Dsfr") {
    return (
      <Suspense>
        <FilterAndSearchDsfr order={order} search={search} view={view} />
      </Suspense>
    );
  }

  return <FilterAndSearchDefault order={order} search={search} view={view} />;
};

const FilterAndSearchDefault = ({ order, search, view }: FilterAndSearchProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations("board");
  const [searchValue, setSearchValue] = useState(search ?? "");

  const ORDER_LABELS: Record<Order, string> = {
    trending: t("trending"),
    top: t("top"),
    new: t("new"),
  };

  const updateParam = (key: string, value: string, defaultValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        value={order}
        onValueChange={(value: string) => {
          if (value) updateParam("order", value, defaultOrder);
        }}
        className="w-full"
      >
        {Object.entries(ORDER_OPTIONS).map(([key, { icon: Icon }]) => (
          <SegmentedControlItem key={key} value={key} className="flex-1">
            <Icon className="size-4" />
            {ORDER_LABELS[key as Order]}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      <div className="flex items-center gap-2">
        <Button disabled title={t("filterComing")} variant="outline" size="icon">
          <Filter className="size-4" />
        </Button>
        <form
          className="flex flex-1 items-center gap-1"
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Input
            className="flex-1"
            placeholder={t("search")}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="size-4" />
          </Button>
        </form>
        <div className="flex rounded-md border">
          <Button
            title={t("viewCards")}
            variant={view === "cards" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => updateParam("view", "cards", defaultView)}
            aria-pressed={view === "cards"}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            title={t("viewList")}
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => updateParam("view", "list", defaultView)}
            aria-pressed={view === "list"}
          >
            <List className="size-4" />
          </Button>
          {/* TODO: réactiver kanban et kanban-accordion quand les wireframes seront implémentés */}
        </div>
      </div>
    </div>
  );
};
