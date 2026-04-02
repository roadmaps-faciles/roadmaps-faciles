"use client";

import "@codegouvfr/react-dsfr/assets/dsfr_plus_icons.css";
import { type ReactNode } from "react";

import { DsfrProvider, StartDsfrOnHydration } from "@/gouv/dsfr-bootstrap";

/**
 * Shell that loads DSFR CSS (via side-effect import) + JS context (DsfrProvider).
 * Must be loaded via next/dynamic to avoid Turbopack bundling CSS eagerly.
 */
export const DsfrShell = ({ children, lang }: { children: ReactNode; lang: string }) => (
  <DsfrProvider lang={lang}>
    <StartDsfrOnHydration />
    {children}
  </DsfrProvider>
);
