import { type useTranslations } from "next-intl";
import { z } from "zod";

import { AVAILABLE_LOCALES, DEFAULT_LOCALE } from "./i18n";

export type ValidationTranslator = ReturnType<typeof useTranslations<"validation">>;

export const createPercentageSchema = (t: ValidationTranslator) =>
  z
    .number({ error: t("percentageRequired") })
    .positive(t("percentagePositive"))
    .max(100, t("percentageMax"));

export const localeSchema = z.enum(AVAILABLE_LOCALES).default(DEFAULT_LOCALE);

export const createSubdomainSchema = (t: ValidationTranslator) =>
  z
    .string()
    .min(3, t("subdomainMinLength", { min: 3 }))
    .max(63, t("subdomainMaxLength", { max: 63 }))
    .regex(/^[a-z0-9-_]+$/, t("subdomainInvalidChars"))
    .regex(/^[a-z0-9]/, t("subdomainMustStartAlphanumeric"))
    .regex(/[a-z0-9]$/, t("subdomainMustEndAlphanumeric"));
