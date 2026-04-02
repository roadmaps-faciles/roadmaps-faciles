"use client";

import { Badge, Switch } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { UIAlert, UIButton } from "@/ui/bridge";

import { updateRootOAuthProviders } from "./actions";

interface ProviderConfig {
  configured: boolean;
  key: "github" | "google" | "proconnect";
  label: string;
}

interface RootAuthenticationFormProps {
  initialValues: { [key: string]: boolean };
  providers: ProviderConfig[];
}

export const RootAuthenticationForm = ({ providers, initialValues }: RootAuthenticationFormProps) => {
  const t = useTranslations("rootAdmin.authentication");
  const [values, setValues] = useState(initialValues);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" }>();

  const handleToggle = (key: string, checked: boolean) => {
    setValues(prev => ({ ...prev, [key]: checked }));
  };

  const handleSave = () => {
    setMessage(undefined);
    startTransition(async () => {
      const result = await updateRootOAuthProviders(values);
      if (result.ok) {
        setMessage({ type: "success", text: t("saveSuccess") });
      } else {
        setMessage({ type: "error", text: t("saveError") });
      }
    });
  };

  return (
    <div className="space-y-4">
      {message && <UIAlert variant={message.type === "error" ? "destructive" : "default"} description={message.text} />}

      <div className="rounded-lg border">
        {providers.map((provider, index) => (
          <div
            key={provider.key}
            className={`flex items-center justify-between p-4 ${index < providers.length - 1 ? "border-b" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{provider.label}</span>
              {!provider.configured && (
                <Badge variant="secondary" className="text-xs">
                  {t("providerNotConfigured")}
                </Badge>
              )}
            </div>
            <Switch
              checked={values[provider.key] ?? false}
              disabled={!provider.configured}
              onCheckedChange={checked => handleToggle(provider.key, checked)}
            />
          </div>
        ))}
      </div>

      <UIButton disabled={isPending} onClick={handleSave}>
        {isPending ? "..." : t("providerEnabled")}
      </UIButton>
    </div>
  );
};
