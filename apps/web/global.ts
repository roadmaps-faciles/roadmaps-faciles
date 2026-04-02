import "global.d";

import { type Locale } from "@/utils/i18n";

import type messages from "./messages/fr.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
