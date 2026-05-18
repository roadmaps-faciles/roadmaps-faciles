"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from "@roadmaps-faciles/ui";
import { Globe, type LucideProps, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { type TenantSettings } from "@/prisma/client";

import { saveAuthenticationSettings, saveForce2FASettings, saveOAuthProviders } from "./actions";

const OAUTH_PROVIDERS = ["github", "google", "proconnect"] as const;

const GithubIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const PROVIDER_ICONS: Record<string, React.FC<LucideProps>> = {
  github: GithubIcon,
  google: Globe,
  proconnect: Shield,
};

interface AuthenticationFormProps {
  availableProviders: string[];
  enabledProviders: string[];
  tenantSettings: TenantSettings;
}

export const AuthenticationForm = ({
  tenantSettings,
  enabledProviders: initialEnabledProviders,
  availableProviders,
}: AuthenticationFormProps) => {
  const t = useTranslations("domainAdmin.authentication");
  const tc = useTranslations("common");
  const router = useRouter();
  const [policy, setPolicy] = useState(tenantSettings.emailRegistrationPolicy);
  const [domains, setDomains] = useState(tenantSettings.allowedEmailDomains);
  const [newDomain, setNewDomain] = useState("");
  const [force2FA, setForce2FA] = useState(tenantSettings.force2FA);
  const [graceDays, setGraceDays] = useState(tenantSettings.force2FAGraceDays);
  const [enabledProviders, setEnabledProviders] = useState<string[]>(initialEnabledProviders);

  const policies = [
    { label: t("policyAnyone"), value: "ANYONE" },
    { label: t("policyNoone"), value: "NOONE" },
    { label: t("policyDomains"), value: "DOMAINS" },
  ];

  const graceOptions = Array.from({ length: 6 }, (_, i) => ({
    label: i === 0 ? t("immediate") : t("days", { count: i }),
    value: String(i),
  }));

  const handleSave = async () => {
    await saveAuthenticationSettings({ emailRegistrationPolicy: policy, allowedEmailDomains: domains });
    router.refresh();
  };

  const handleSaveForce2FA = async () => {
    await saveForce2FASettings({ force2FA, force2FAGraceDays: graceDays });
    router.refresh();
  };

  const handleSaveOAuth = async () => {
    await saveOAuthProviders({ providers: enabledProviders });
    router.refresh();
  };

  const addDomain = () => {
    if (newDomain && !domains.includes(newDomain)) {
      setDomains([...domains, newDomain]);
      setNewDomain("");
    }
  };

  const removeDomain = (domain: string) => {
    setDomains(domains.filter(d => d !== domain));
  };

  const toggleProvider = (provider: string) => {
    setEnabledProviders(prev => (prev.includes(provider) ? prev.filter(p => p !== provider) : [...prev, provider]));
  };

  return (
    <div className="space-y-8">
      {/* Email Registration Policy */}
      <div className="space-y-4">
        <div className="space-y-2 max-w-xs">
          <Label htmlFor="registration-policy">{t("registrationPolicy")}</Label>
          <Select value={policy} onValueChange={v => setPolicy(v as typeof policy)}>
            <SelectTrigger id="registration-policy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {policies.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {policy === "DOMAINS" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t("allowedDomains")}</h3>
            <ul className="space-y-1">
              {domains.map(domain => (
                <li key={domain} className="flex items-center gap-2">
                  <Badge variant="secondary">{domain}</Badge>
                  <Button variant="ghost" size="sm" title={t("removeDomain")} onClick={() => removeDomain(domain)}>
                    ×
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex items-end gap-2 max-w-sm">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-domain">{t("addDomain")}</Label>
                <Input
                  id="new-domain"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  autoComplete="off"
                  name="new-domain"
                />
              </div>
              <Button onClick={addDomain}>{tc("add")}</Button>
            </div>
          </div>
        )}

        <Button onClick={() => void handleSave()}>{tc("save")}</Button>
      </div>

      {/* Force 2FA */}
      <Separator />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("force2FATitle")}</h2>
        <div className="flex items-center gap-3">
          <Switch id="force-2fa" checked={force2FA} onCheckedChange={setForce2FA} />
          <Label htmlFor="force-2fa">{t("force2FAToggle")}</Label>
        </div>

        {force2FA && (
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="grace-period">{t("gracePeriod")}</Label>
            <Select value={String(graceDays)} onValueChange={v => setGraceDays(Number(v))}>
              <SelectTrigger id="grace-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {graceOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={() => void handleSaveForce2FA()}>{tc("save")}</Button>
      </div>

      {/* OAuth Providers */}
      {availableProviders.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("oauthTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("oauthDescription")}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OAUTH_PROVIDERS.filter(p => availableProviders.includes(p)).map(provider => {
                const Icon = PROVIDER_ICONS[provider] ?? Globe;
                const enabled = enabledProviders.includes(provider);
                return (
                  <Card key={provider}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="size-5" />
                        <CardTitle className="text-base">{t(`provider.${provider}`)}</CardTitle>
                      </div>
                      <Badge variant={enabled ? "default" : "secondary"}>
                        {enabled ? t("enabled") : t("disabled")}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3">{t(`providerDescription.${provider}`)}</CardDescription>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`oauth-${provider}`}
                          checked={enabled}
                          onCheckedChange={() => toggleProvider(provider)}
                        />
                        <Label htmlFor={`oauth-${provider}`} className="text-sm">
                          {enabled ? t("active") : t("inactive")}
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <Button onClick={() => void handleSaveOAuth()}>{tc("save")}</Button>
          </div>
        </>
      )}
    </div>
  );
};
