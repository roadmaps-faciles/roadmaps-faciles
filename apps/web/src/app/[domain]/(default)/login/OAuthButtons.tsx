"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

import { UIButton } from "@/ui/bridge";

interface OAuthButtonsProps {
  providers: string[];
}

const PROVIDER_KEYS = {
  github: "provider.github",
  google: "provider.google",
  proconnect: "provider.proconnect",
} as const;

export const OAuthButtons = ({ providers }: OAuthButtonsProps) => {
  const t = useTranslations("auth");

  if (providers.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {providers.map(provider => (
        <UIButton key={provider} variant="outline" onClick={() => void signIn(provider)} className="w-full">
          {provider in PROVIDER_KEYS
            ? t(PROVIDER_KEYS[provider as keyof typeof PROVIDER_KEYS])
            : provider.charAt(0).toUpperCase() + provider.slice(1)}
        </UIButton>
      ))}
    </div>
  );
};
