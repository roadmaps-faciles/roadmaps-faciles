"use client";

import { Alert, AlertDescription, Button, Hint, Input, Label } from "@roadmaps-faciles/ui";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";

import { testGitHubConnection } from "../../actions";
import { useGitHubWizardStore } from "../useGitHubWizardStore";

interface GitHubConnectionStepProps {
  appName: string;
}

export const GitHubConnectionStep = ({ appName }: GitHubConnectionStepProps) => {
  const t = useTranslations("domainAdmin.integrations.github.wizard");
  const tWizard = useTranslations("domainAdmin.integrations.wizard");
  const {
    apiKey,
    authType,
    installationId,
    connectionStatus,
    connectionBotName,
    errorMessage,
    setApiKey,
    setAuthType,
    setAppInstallation,
    setConnectionSuccess,
    setConnectionError,
    setConnectionStatus,
  } = useGitHubWizardStore();

  const handleTestPat = useCallback(async () => {
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

  const validatedRef = useRef<null | number>(null);

  useEffect(() => {
    if (authType !== "app" || !installationId) return;
    if (validatedRef.current === installationId) return;
    if (connectionBotName) return;

    validatedRef.current = installationId;
    setConnectionStatus("testing");
    void testGitHubConnection({ authType: "app", installationId }).then(result => {
      if (!result.ok) {
        setConnectionError(result.error);
        return;
      }
      if (result.data.success) {
        setAppInstallation(installationId, result.data.botName ?? "");
      } else {
        setConnectionError(tWizard("connectionFailed"));
      }
    });
  }, [
    authType,
    installationId,
    connectionBotName,
    setConnectionStatus,
    setConnectionError,
    setAppInstallation,
    tWizard,
  ]);

  const installAppUrl = appName ? `https://github.com/apps/${appName}/installations/new` : null;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Button
          variant={authType === "app" ? "default" : "outline"}
          size="sm"
          onClick={() => setAuthType("app")}
          disabled={!installAppUrl}
        >
          {t("authApp")}
        </Button>
        <Button variant={authType === "pat" ? "default" : "outline"} size="sm" onClick={() => setAuthType("pat")}>
          {t("authPat")}
        </Button>
      </div>

      {authType === "app" ? (
        <>
          <p className="mb-4">{t("appDescription")}</p>

          {!installationId && installAppUrl && (
            <Button asChild>
              <a href={installAppUrl} target="_blank" rel="noopener noreferrer">
                {t("installApp")}
              </a>
            </Button>
          )}

          {installationId && connectionStatus === "testing" && (
            <Alert className="mt-4">
              <AlertDescription>{tWizard("testing")}</AlertDescription>
            </Alert>
          )}

          {installationId && connectionStatus === "success" && (
            <Alert className="mt-4">
              <AlertDescription>{t("appConnected", { installationId, botName: connectionBotName })}</AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <>
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
            onClick={() => void handleTestPat()}
            disabled={!apiKey.trim() || connectionStatus === "testing"}
          >
            {connectionStatus === "testing" ? tWizard("testing") : tWizard("testConnection")}
          </Button>

          {connectionStatus === "success" && (
            <Alert className="mt-4">
              <AlertDescription>{tWizard("connectionSuccess", { botName: connectionBotName })}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      {connectionStatus === "error" && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{errorMessage || tWizard("connectionFailed")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
