"use client";

import { LanguageSelect } from "@codegouvfr/react-dsfr/LanguageSelect";
import { useLocale } from "next-intl";

import { LOCALE_COOKIE, LOCALE_LABELS, LOCALES } from "@/utils/i18n";

export const LanguageSelectClient = () => {
  const locale = useLocale();

  return (
    <LanguageSelect
      lang={locale}
      supportedLangs={LOCALES}
      fullNameByLang={LOCALE_LABELS}
      setLang={newLocale => {
        document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
        window.location.reload();
      }}
    />
  );
};
