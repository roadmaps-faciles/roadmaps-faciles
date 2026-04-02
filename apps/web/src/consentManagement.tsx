"use client";

import { createConsentManagement } from "@codegouvfr/react-dsfr/consentManagement";
import { type ReactNode } from "react";

const trackingProvider = process.env.NEXT_PUBLIC_TRACKING_PROVIDER || "noop";

type FinalityEntry = { description: ReactNode; title: ReactNode };

const translations = {
  fr: {
    matomo: { title: "Matomo", description: "Outil d'analyse comportementale des utilisateurs." },
    posthog: { title: "PostHog", description: "Outil d'analyse produit et de suivi comportemental." },
  },
  en: {
    matomo: { title: "Matomo", description: "User behavior analytics tool." },
    posthog: { title: "PostHog", description: "Product analytics and behavioral tracking tool." },
  },
} as const;

function buildFinalities(lang: string): Record<string, FinalityEntry> {
  const t = lang === "en" ? translations.en : translations.fr;

  if (trackingProvider === "posthog") {
    return { posthog: { title: t.posthog.title, description: t.posthog.description } };
  }

  if (trackingProvider === "matomo") {
    return { matomo: { title: t.matomo.title, description: t.matomo.description } };
  }

  return {};
}

export const {
  ConsentBannerAndConsentManagement,
  FooterConsentManagementItem,
  FooterPersonalDataPolicyItem,
  useConsent,
} = createConsentManagement({
  finalityDescription: ({ lang }) => buildFinalities(lang),
  personalDataPolicyLinkProps: {
    href: "/politique-de-confidentialite#cookies",
  },
});
