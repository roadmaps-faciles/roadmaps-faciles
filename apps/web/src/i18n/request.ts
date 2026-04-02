import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/utils/i18n";

// eslint-disable-next-line import/no-default-export -- required by next-intl
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get(LOCALE_COOKIE)?.value as Locale) || DEFAULT_LOCALE;

  return {
    locale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- dynamic import for locale JSON
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
