"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useTranslations } from "next-intl";

import { type RoadmapFilter, type RoadmapFilterBarProps, type RoadmapSort } from "./RoadmapFilterBar";
import styles from "./RoadmapFilterBarDsfr.module.scss";

export const RoadmapFilterBarDsfr = ({
  availableTags,
  filter,
  onChange,
  hasProgressSort = true,
}: RoadmapFilterBarProps) => {
  const t = useTranslations("roadmap.filterBar");

  const setPart = <K extends keyof RoadmapFilter>(key: K, value: RoadmapFilter[K]) =>
    onChange({ ...filter, [key]: value });

  const sortOptions: Array<{ label: string; value: RoadmapSort }> = [
    { label: t("sortVotes"), value: "votes" },
    { label: t("sortRecent"), value: "recent" },
    ...(hasProgressSort ? [{ label: t("sortProgress"), value: "progress" as RoadmapSort }] : []),
  ];

  return (
    <section className={cx("fr-container", "fr-py-3w", styles.filterBar)}>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-4">
          <label className={fr.cx("fr-label")} htmlFor="search-roadmap-filter-input">
            {t("searchLabel")}
          </label>
          <SearchBar
            id="roadmap-filter"
            className={styles.searchBar}
            label={t("searchPlaceholder")}
            renderInput={({ className, id, placeholder, type }) => (
              <input
                id={id}
                className={className}
                placeholder={placeholder}
                type={type}
                value={filter.search}
                onChange={e => setPart("search", e.target.value)}
                aria-label={t("searchPlaceholder")}
              />
            )}
          />
        </div>

        <div className={cx("fr-col-12", "fr-col-md-6", styles.tagsColumn)}>
          <p className={cx(fr.cx("fr-label"), styles.tagsLabel)}>{t("categoriesLabel")}</p>
          <ul className={cx(fr.cx("fr-tags-group"), styles.tagsGroup)}>
            <li>
              <Tag
                as="button"
                small
                pressed={filter.selectedTag === null}
                nativeButtonProps={{
                  onClick: () => setPart("selectedTag", null),
                }}
              >
                {t("allCategories")}
              </Tag>
            </li>
            {availableTags.map(({ tag, count }) => (
              <li key={tag}>
                <Tag
                  as="button"
                  small
                  pressed={filter.selectedTag === tag}
                  nativeButtonProps={{
                    onClick: () => setPart("selectedTag", filter.selectedTag === tag ? null : tag),
                  }}
                >
                  <span>{tag}</span>
                  <span className="ml-1 opacity-70 tabular-nums">{count}</span>
                </Tag>
              </li>
            ))}
          </ul>
        </div>

        <div className="fr-col-12 fr-col-md-2">
          <Select
            className={styles.sortSelect}
            label={t("sortBy")}
            nativeSelectProps={{
              value: filter.sort,
              onChange: e => setPart("sort", e.target.value),
            }}
            options={sortOptions}
          />
        </div>
      </div>
    </section>
  );
};
