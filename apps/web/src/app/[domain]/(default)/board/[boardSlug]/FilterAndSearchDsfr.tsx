"use client";

import { fr, type FrIconClassName, type RiIconClassName } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import DsfrSearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { SegmentedControl as DsfrSegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { defaultOrder, defaultView, type Order, type View } from "./types";

export interface FilterAndSearchDsfrProps {
  order: Order;
  search?: string;
  view: View;
}

/** DSFR icon IDs for sort order segments — Lucide equivalents live in types.ts ORDER_OPTIONS */
const ORDER_ICONS: Record<Order, FrIconClassName> = {
  trending: "fr-icon-star-s-line",
  top: "fr-icon-arrow-right-up-line",
  new: "fr-icon-sparkling-2-line",
};

const VIEW_BUTTONS: Array<{ iconId: FrIconClassName | RiIconClassName; key: View; titleKey: string }> = [
  { key: "cards", iconId: "ri-layout-grid-line", titleKey: "viewCards" },
  { key: "list", iconId: "ri-list-unordered", titleKey: "viewList" },
  // TODO: réactiver kanban et kanban-accordion quand les wireframes seront implémentés
  // { key: "kanban", iconId: "ri-layout-column-line", titleKey: "viewKanban" },
  // { key: "kanban-accordion", iconId: "ri-layout-row-line", titleKey: "viewKanbanAccordion" },
];

export const FilterAndSearchDsfr = ({ order, search, view }: FilterAndSearchDsfrProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations("board");
  const [searchValue, setSearchValue] = useState(search ?? "");

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
      <DsfrSegmentedControl
        hideLegend
        legend={t("sortBy")}
        name="order"
        small
        className={cx(fr.cx("fr-mb-2w"), "w-full")}
        classes={{ elements: "grow justify-between" }}
        segments={[
          {
            iconId: ORDER_ICONS.trending,
            label: t("trending"),
            nativeInputProps: {
              checked: order === "trending",
              onChange: () => updateParam("order", "trending", defaultOrder),
            },
          },
          {
            iconId: ORDER_ICONS.top,
            label: t("top"),
            nativeInputProps: {
              checked: order === "top",
              onChange: () => updateParam("order", "top", defaultOrder),
            },
          },
          {
            iconId: ORDER_ICONS.new,
            label: t("new"),
            nativeInputProps: {
              checked: order === "new",
              onChange: () => updateParam("order", "new", defaultOrder),
            },
          },
        ]}
      />

      <div className="flex items-center gap-2">
        <form
          className="flex-1"
          onSubmit={e => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <DsfrSearchBar
            renderInput={({ className, id, type }) => (
              <input
                className={className}
                id={id}
                type={type}
                placeholder={`${t("search")}…`}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
              />
            )}
            onButtonClick={handleSearch}
          />
        </form>
        <div className="flex">
          {VIEW_BUTTONS.map(({ key, iconId, titleKey }) => (
            <Button
              key={key}
              iconId={iconId}
              priority={view === key ? "primary" : "tertiary no outline"}
              size="small"
              onClick={() => updateParam("view", key, defaultView)}
              title={t(titleKey as Parameters<typeof t>[0])}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
