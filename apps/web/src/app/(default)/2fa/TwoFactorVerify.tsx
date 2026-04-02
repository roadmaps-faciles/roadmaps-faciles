"use client";

import { Alert, AlertDescription, Button, Input, Label } from "@roadmaps-faciles/ui";
import { startAuthentication } from "@simplewebauthn/browser";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TwoFactorVerifyProps {
  hasEmail: boolean;
  hasOtp: boolean;
  hasPasskey: boolean;
  redirectUrl?: string;
}

export const TwoFactorVerify = ({ hasPasskey, hasOtp, hasEmail, redirectUrl = "/" }: TwoFactorVerifyProps) => {
  const t = useTranslations("auth.twoFactor");
  const router = useRouter();
  const { update } = useSession();
  const [method, setMethod] = useState<"email" | "otp" | "passkey" | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSuccess = async () => {
    await update({ twoFactorVerified: true });
    router.push(redirectUrl);
    router.refresh();
  };

  const handlePasskey = async () => {
    setLoading(true);
    setError(null);
    try {
      const optionsRes = await fetch("/api/ee/webauthn/authenticate/options", { method: "POST" });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const options = await optionsRes.json();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const assertion = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch("/api/ee/webauthn/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      });

      if (verifyRes.ok) {
        await handleSuccess();
      } else {
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ee/2fa/email/send", { method: "POST" });
      if (res.ok) {
        setEmailSent(true);
        setMethod("email");
      } else {
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        await handleSuccess();
      } else {
        setError(t("invalidCode"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-6 text-muted-foreground">{t("description")}</p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!method && (
        <div className="flex flex-col gap-4">
          {hasPasskey && (
            <Button onClick={() => void handlePasskey()} disabled={loading}>
              {t("usePasskey")}
            </Button>
          )}
          {hasOtp && (
            <Button variant="outline" onClick={() => setMethod("otp")} disabled={loading}>
              {t("useOtp")}
            </Button>
          )}
          {hasEmail && (
            <Button variant="outline" onClick={() => void handleSendEmail()} disabled={loading}>
              {t("useEmail")}
            </Button>
          )}
        </div>
      )}

      {method === "otp" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp-code">{t("otpLabel")}</Label>
            <Input
              id="otp-code"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              name="otp-code"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void handleVerifyCode("/api/ee/otp/verify")} disabled={loading || code.length !== 6}>
              {t("verify")}
            </Button>
            <Button variant="ghost" onClick={() => setMethod(null)}>
              {t("back")}
            </Button>
          </div>
        </div>
      )}

      {method === "email" && emailSent && (
        <div className="space-y-4">
          <Alert className="mb-4">
            <AlertDescription>{t("emailSent")}</AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="email-code">{t("emailLabel")}</Label>
            <Input
              id="email-code"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              name="email-code"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => void handleVerifyCode("/api/ee/2fa/email/verify")}
              disabled={loading || code.length !== 6}
            >
              {t("verify")}
            </Button>
            <Button variant="ghost" onClick={() => setMethod(null)}>
              {t("back")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
