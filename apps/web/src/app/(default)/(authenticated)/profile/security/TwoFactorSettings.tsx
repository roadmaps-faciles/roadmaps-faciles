"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { UIAlert, UIBadge, UIButton, UIInput, UISeparator, UISwitch } from "@/ui/bridge";

import { removeOtp, removePasskey, toggleEmailTwoFactor } from "./actions";

interface Passkey {
  credentialBackedUp: boolean;
  credentialDeviceType: string;
  credentialID: string;
}

interface TwoFactorSettingsProps {
  emailEnabled: boolean;
  otpConfigured: boolean;
  passkeys: Passkey[];
}

export const TwoFactorSettings = ({ emailEnabled, otpConfigured, passkeys }: TwoFactorSettingsProps) => {
  const t = useTranslations("profile.security");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [otpSetup, setOtpSetup] = useState<{ qrCode: string; secret: string } | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const handleToggleEmail = async () => {
    setLoading(true);
    const result = await toggleEmailTwoFactor();
    if (!result.ok) {
      setError(result.error);
    }
    setLoading(false);
    router.refresh();
  };

  const handleSetupOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ee/otp/setup", { method: "POST" });
      const data = (await res.json()) as { qrCode: string; secret: string };
      setOtpSetup(data);
    } catch {
      setError(t("otpSetupError"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ee/otp/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode }),
      });
      if (res.ok) {
        setOtpSetup(null);
        setOtpCode("");
        router.refresh();
      } else {
        setError(t("otpInvalidCode"));
      }
    } catch {
      setError(t("otpSetupError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOtp = async () => {
    setLoading(true);
    const result = await removeOtp();
    if (!result.ok) {
      setError(result.error);
    }
    setLoading(false);
    router.refresh();
  };

  const handleAddPasskey = async () => {
    setLoading(true);
    setError(null);
    try {
      const optionsRes = await fetch("/api/ee/webauthn/register/options", { method: "POST" });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const options = await optionsRes.json();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const registration = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch("/api/ee/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration),
      });

      if (verifyRes.ok) {
        router.refresh();
      } else {
        setError(t("passkeyError"));
      }
    } catch {
      setError(t("passkeyError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePasskey = async (credentialId: string) => {
    setLoading(true);
    const result = await removePasskey(credentialId);
    if (!result.ok) {
      setError(result.error);
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      {error && <UIAlert variant="destructive" description={error} className="mb-4" />}

      {/* Email 2FA */}
      <h3 className="mb-1 text-lg font-semibold">{t("emailTitle")}</h3>
      <p className="mb-3 text-sm text-muted-foreground">{t("emailDescription")}</p>
      <UISwitch
        label={t("emailToggle")}
        checked={emailEnabled}
        onCheckedChangeAction={() => void handleToggleEmail()}
        disabled={loading}
      />

      <UISeparator className="my-6" />

      {/* OTP (TOTP) */}
      <h3 className="mb-1 text-lg font-semibold">{t("otpTitle")}</h3>
      <p className="mb-3 text-sm text-muted-foreground">{t("otpDescription")}</p>
      {otpConfigured && !otpSetup ? (
        <div className="flex items-center gap-2">
          <UIBadge>{t("active")}</UIBadge>
          <UIButton variant="ghost" size="sm" onClick={() => void handleRemoveOtp()} disabled={loading}>
            {t("remove")}
          </UIButton>
        </div>
      ) : otpSetup ? (
        <div className="space-y-4">
          <p className="text-sm">{t("otpScanQr")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={otpSetup.qrCode} alt="QR Code OTP" className="mb-4" />
          <p className="text-xs text-muted-foreground">
            {t("otpManualKey")}: <code>{otpSetup.secret}</code>
          </p>
          <UIInput
            label={t("otpVerifyLabel")}
            nativeInputProps={{
              id: "otp-setup-code",
              value: otpCode,
              onChange: e => setOtpCode(e.target.value),
              maxLength: 6,
              inputMode: "numeric",
              autoComplete: "one-time-code",
              name: "otp-setup-code",
            }}
          />
          <div className="flex gap-2">
            <UIButton onClick={() => void handleVerifyOtpSetup()} disabled={loading || otpCode.length !== 6}>
              {t("verify")}
            </UIButton>
            <UIButton variant="ghost" onClick={() => setOtpSetup(null)}>
              {t("cancel")}
            </UIButton>
          </div>
        </div>
      ) : (
        <UIButton variant="outline" onClick={() => void handleSetupOtp()} disabled={loading}>
          {t("otpSetup")}
        </UIButton>
      )}

      <UISeparator className="my-6" />

      {/* Passkeys */}
      <h3 className="mb-1 text-lg font-semibold">{t("passkeyTitle")}</h3>
      <p className="mb-3 text-sm text-muted-foreground">{t("passkeyDescription")}</p>
      {passkeys.length > 0 && (
        <ul className="mb-4 space-y-2">
          {passkeys.map(pk => (
            <li key={pk.credentialID} className="flex items-center gap-2">
              <UIBadge variant="secondary">
                {pk.credentialDeviceType === "multiDevice" ? t("synced") : t("device")}
              </UIBadge>
              <code className="text-xs">{pk.credentialID.slice(0, 16)}...</code>
              <UIButton
                variant="ghost"
                size="sm"
                onClick={() => void handleRemovePasskey(pk.credentialID)}
                disabled={loading}
              >
                {t("remove")}
              </UIButton>
            </li>
          ))}
        </ul>
      )}
      <UIButton variant="outline" onClick={() => void handleAddPasskey()} disabled={loading}>
        {t("passkeyAdd")}
      </UIButton>
    </div>
  );
};
