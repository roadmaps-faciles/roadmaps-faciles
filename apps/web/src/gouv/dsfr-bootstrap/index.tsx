"use client";

import { DsfrProviderBase, type DsfrProviderProps, StartDsfrOnHydration } from "@codegouvfr/react-dsfr/next-app-router";

import { Link } from "@/i18n/navigation";

import { defaultColorScheme } from "./defaultColorScheme";

declare module "@codegouvfr/react-dsfr/next-app-router" {
  interface RegisterLink {
    Link: typeof Link;
  }
}

export function DsfrProvider(props: DsfrProviderProps) {
  return <DsfrProviderBase {...props} defaultColorScheme={defaultColorScheme} Link={Link} {...props} />;
}

export { StartDsfrOnHydration };
