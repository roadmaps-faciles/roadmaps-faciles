"use client";

import { Alert, AlertDescription, Button, Hint, Input, Label } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { testGitHubConnection } from "../../actions";
import { useGitHubWizardStore } from "../useGitHubWizardStore";

export const GitHubConnectionStep = () => {
  const t = useTranslations("domainAdmin.integrations.github.wizard");
  const tWizard = useTranslations("domainAdmin.integrations.wizard");
  const {
    apiKey,
    connectionStatus,
    connectionBotName,
    errorMessage,
    setApiKey,
    setConnectionSuccess,
    setConnectionError,
    setConnectionStatus,
  } = useGitHubWizardStore();

  const handleTest = useCallback(async () => {
    if (!apiKey.trim()) return;
    setConnectionStatus("testing");

    const result = await testGitHubConnection({ apiKey, authType: "pat" });
    if (!result.ok) {
      setConnectionError(result.error);
      return;
    }

    if (result.data.success) {
      setConnectionSuccess(result.data.botName ?? "");
    } else {
      setConnectionError(tWizard("connectionFailed"));
    }
  }, [apiKey, setConnectionStatus, setConnectionSuccess, setConnectionError, tWizard]);

  return (
    <div>
      <p className="mb-4">{t("connectionDescription")}</p>

      <div className="mb-4 space-y-2">
        <Label htmlFor="github-api-key">{t("apiKeyLabel")}</Label>
        <Input
          id="github-api-key"
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="ghp_... / github_pat_..."
        />
        <Hint>{t("apiKeyHint")}</Hint>
      </div>

      <Button
        variant="outline"
        onClick={() => void handleTest()}
        disabled={!apiKey.trim() || connectionStatus === "testing"}
      >
        {connectionStatus === "testing" ? tWizard("testing") : tWizard("testConnection")}
      </Button>

      {connectionStatus === "success" && (
        <Alert className="mt-4">
          <AlertDescription>{tWizard("connectionSuccess", { botName: connectionBotName })}</AlertDescription>
        </Alert>
      )}
      {connectionStatus === "error" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{errorMessage || tWizard("connectionFailed")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
