"use client";

import { Alert, AlertDescription, Button, Hint, Input, Label } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { testNotionConnection } from "../../actions";
import { useNotionWizardStore } from "../useNotionWizardStore";

export const ConnectionStep = () => {
  const t = useTranslations("domainAdmin.integrations.wizard");
  const {
    apiKey,
    connectionStatus,
    botName,
    errorMessage,
    updateApiKey,
    setConnectionTesting,
    setConnectionSuccess,
    setConnectionError,
  } = useNotionWizardStore();

  const handleTest = useCallback(async () => {
    if (!apiKey.trim()) return;
    setConnectionTesting();

    const result = await testNotionConnection({ apiKey });
    if (!result.ok) {
      setConnectionError(result.error);
      return;
    }

    if (result.data.success) {
      setConnectionSuccess(result.data.botName ?? "");
    } else {
      setConnectionError(t("connectionFailed"));
    }
  }, [apiKey, setConnectionTesting, setConnectionSuccess, setConnectionError, t]);

  return (
    <div>
      <p className="mb-4">{t("connectionDescription")}</p>

      <div className="mb-4 space-y-2">
        <Label htmlFor="api-key">{t("apiKeyLabel")}</Label>
        <Input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={e => updateApiKey(e.target.value)}
          placeholder="ntn_..."
        />
        <Hint>{t("apiKeyHint")}</Hint>
      </div>

      <Button
        variant="outline"
        onClick={() => void handleTest()}
        disabled={!apiKey.trim() || connectionStatus === "testing"}
      >
        {connectionStatus === "testing" ? t("testing") : t("testConnection")}
      </Button>

      {connectionStatus === "success" && (
        <Alert className="mt-4">
          <AlertDescription>{t("connectionSuccess", { botName })}</AlertDescription>
        </Alert>
      )}
      {connectionStatus === "error" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{errorMessage || t("connectionFailed")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
