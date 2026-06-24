"use client";

import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type ComponentType, type SVGProps } from "react";

import { isSafeRelativeCallbackUrl } from "@/app/(default)/login/loginHrefs";
import { UIButton } from "@/ui/bridge";

import { ProConnectIcon } from "./oauthIcons";

interface OAuthButtonsProps {
  providers: string[];
}

interface ProviderConfig {
  Icon: ComponentType<{ size?: number | string } & SVGProps<SVGSVGElement>>;
  key: string;
  size: string;
}

const PROVIDER_CONFIG: Record<string, ProviderConfig> = {
  github: { Icon: SiGithub, key: "provider.github", size: "size-6" },
  google: { Icon: SiGoogle, key: "provider.google", size: "size-6" },
  proconnect: { Icon: ProConnectIcon, key: "provider.proconnect", size: "size-8" },
};

export const OAuthButtons = ({ providers }: OAuthButtonsProps) => {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const callbackUrlRaw = searchParams.get("callbackUrl");
  // URL relative same-host only ; NextAuth fallback "/" pour les autres.
  const callbackUrl = isSafeRelativeCallbackUrl(callbackUrlRaw) ? callbackUrlRaw : undefined;

  if (providers.length === 0) return null;

  return (
    <div className="flex flex-row flex-wrap justify-center gap-3">
      {providers.map(provider => {
        const config = PROVIDER_CONFIG[provider];
        const label = config ? t(config.key as never) : provider.charAt(0).toUpperCase() + provider.slice(1);
        const Icon = config?.Icon;

        return (
          <UIButton
            key={provider}
            variant="outline"
            size="icon"
            className="size-12"
            onClick={() => void signIn(provider, callbackUrl ? { callbackUrl } : undefined)}
            aria-label={label}
            title={label}
          >
            {Icon ? <Icon className={config.size} /> : <span className="text-xs">{label.slice(0, 2)}</span>}
          </UIButton>
        );
      })}
    </div>
  );
};
