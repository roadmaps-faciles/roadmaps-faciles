"use client";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from "@roadmaps-faciles/ui";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { type DbUserInfo, type EmTestCall, type EmTestResult, testEspaceMembreLogin } from "./actions";

const CallResult = ({ call, title }: { call: EmTestCall; title: string }) => {
  const t = useTranslations("rootAdmin.emTest");

  const statusLabel =
    call.status === "found" ? t("statusFound") : call.status === "notFound" ? t("statusNotFound") : t("statusError");

  const rows: Array<{ label: string; value: string }> = [];
  if (call.status === "found") {
    rows.push({ label: t("isActive"), value: call.isActive ? t("yes") : t("no") });
    if (call.username) rows.push({ label: t("username"), value: call.username });
    if (call.role) rows.push({ label: t("role"), value: call.role });
    if (call.communicationEmail) rows.push({ label: t("communicationEmail"), value: call.communicationEmail });
    if (call.resolvedLoginEmail) rows.push({ label: t("resolvedEmail"), value: call.resolvedLoginEmail });
  } else if (call.status === "error") {
    if (call.errorName) rows.push({ label: "Error", value: call.errorName });
    if (call.errorMessage) rows.push({ label: "Message", value: call.errorMessage });
  }
  rows.push({ label: t("duration"), value: `${call.durationMs} ms` });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Badge variant={call.status === "found" ? "default" : "destructive"}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent>
        <dl>
          {rows.map(row => (
            <div key={row.label} className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0">
              <dt className="text-sm font-medium">{row.label}</dt>
              <dd className="text-right text-sm font-semibold break-all">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};

const DbColumn = ({ info, title }: { info: DbUserInfo | undefined; title: string }) => {
  const t = useTranslations("rootAdmin.emTest");
  const hasOtp = !!(info?.hasOtpSecret && info.hasOtpVerifiedAt);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        {info?.exists ? (
          <Badge variant={hasOtp ? "destructive" : "secondary"}>{hasOtp ? t("dbHasOtp") : t("dbExists")}</Badge>
        ) : (
          <Badge variant="secondary">{t("dbNone")}</Badge>
        )}
      </div>
      {info?.exists && (
        <dl className="text-sm">
          <div className="flex items-center justify-between gap-4 border-b py-1.5">
            <dt className="text-muted-foreground">{t("dbHasOtp")}</dt>
            <dd className="font-semibold">{hasOtp ? t("yes") : t("no")}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b py-1.5">
            <dt className="text-muted-foreground">{t("dbTwoFactor")}</dt>
            <dd className="font-semibold">{info.twoFactorEnabled ? t("yes") : t("no")}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-1.5">
            <dt className="text-muted-foreground">id</dt>
            <dd className="font-mono text-xs">{info.idHint}…</dd>
          </div>
        </dl>
      )}
    </div>
  );
};

export const EmTestForm = () => {
  const t = useTranslations("rootAdmin.emTest");
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<EmTestResult | null>(null);
  const [isRunning, startTransition] = useTransition();

  const handleRun = () => {
    if (!identifier.trim()) {
      toast.error(t("emptyError"));
      return;
    }
    startTransition(async () => {
      const response = await testEspaceMembreLogin(identifier);
      if (response.ok) {
        setResult(response.data);
      } else {
        toast.error(t("emptyError"));
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="em-identifier">{t("identifierLabel")}</Label>
              <Input
                id="em-identifier"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRun()}
                placeholder={t("identifierPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("hint")}</p>
            </div>
            <Button onClick={handleRun} disabled={isRunning || !identifier.trim()}>
              <Search className="mr-2 size-4" />
              {isRunning ? t("running") : t("run")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span>
              <span className="text-muted-foreground">{t("identifierSent")}: </span>
              <code className="font-semibold">{result.identifierSent}</code>
            </span>
            <span>
              <span className="text-muted-foreground">{t("endpoint")}: </span>
              <code className="font-semibold break-all">{result.endpointUrl}</code>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CallResult call={result.cached} title={t("cachedTitle")} />
            <CallResult call={result.fresh} title={t("freshTitle")} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{t("dbTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.dbError ? (
                <p className="text-sm text-destructive">{result.dbError}</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <DbColumn info={result.dbByUsername} title={t("dbByUsernameLabel")} />
                    <DbColumn info={result.dbByEmail} title={t("dbByEmailLabel")} />
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t pt-3 text-sm">
                    <span className="text-muted-foreground">{t("dbSameUser")}</span>
                    <span className="font-semibold">
                      {result.dbSameUser === null || result.dbSameUser === undefined
                        ? "—"
                        : result.dbSameUser
                          ? t("yes")
                          : t("no")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("dbHint")}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
