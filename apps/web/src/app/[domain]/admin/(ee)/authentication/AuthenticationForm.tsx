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
import { Github, Globe, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { type TenantSettings } from "@/prisma/client";

import { saveAuthenticationSettings, saveForce2FASettings, saveOAuthProviders } from "./actions";

const OAUTH_PROVIDERS = ["github", "google", "proconnect"] as const;

const PROVIDER_ICONS: Record<string, typeof Github> = {
  github: Github,
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
