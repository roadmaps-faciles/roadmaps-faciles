"use client";

import { useTranslations } from "next-intl";
import { type SubmitEvent, useState, useTransition } from "react";

import { UIAlert, UIButton, UIInput } from "@/ui/bridge";

import { loginAction, preLoginCheckAction, preLoginVerifyAction } from "./actions";

export interface LoginFormClientProps {
  defaultEmail?: string;
  loginWithEmail?: boolean;
}

export const LoginFormClient = ({ loginWithEmail, defaultEmail }: LoginFormClientProps) => {
  const t = useTranslations("auth");

  const [step, setStep] = useState<"identifier" | "otp">("identifier");
  const [identifier, setIdentifier] = useState(defaultEmail ?? "");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleIdentifierSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!identifier.trim()) return;

    setError(undefined);
    startTransition(async () => {
      try {
        const data = await preLoginCheckAction(identifier.trim(), !loginWithEmail);

        if (data.requiresOtp) {
          setStep("otp");
        } else {
          await loginAction(identifier.trim(), !!loginWithEmail);
        }
      } catch {
        setError(t("twoFactor.error"));
      }
    });
  };

  const handleOtpSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setError(undefined);
    startTransition(async () => {
      try {
        const data = await preLoginVerifyAction(identifier.trim(), otpCode.trim(), !loginWithEmail);
        if (data.verified) {
          await loginAction(identifier.trim(), !!loginWithEmail);
        } else {
          setError(t("twoFactor.invalidCode"));
        }
      } catch {
        setError(t("twoFactor.error"));
      }
    });
  };

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold">{t("preLoginOtp.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("preLoginOtp.description")}</p>
        {error && <UIAlert variant="destructive" description={error} />}
        <UIInput
          label={t("twoFactor.otpLabel")}
          nativeInputProps={{
            id: "otp",
            type: "text",
            inputMode: "numeric",
            pattern: "[0-9]{6}",
            maxLength: 6,
            autoComplete: "one-time-code",
            required: true,
            value: otpCode,
            onChange: e => setOtpCode(e.target.value),
            autoFocus: true,
            "aria-invalid": !!error,
          }}
          state={error ? "error" : "default"}
        />
        <div className="flex gap-3">
          <UIButton type="submit" disabled={isPending}>
            {t("twoFactor.verify")}
          </UIButton>
          <UIButton
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => {
              setStep("identifier");
              setOtpCode("");
              setError(undefined);
            }}
          >
            {t("twoFactor.back")}
          </UIButton>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleIdentifierSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">{loginWithEmail ? t("loginWithEmail") : t("loginWithUsername")}</h2>
      {error && <UIAlert variant="destructive" description={error} />}
      {loginWithEmail ? (
        <UIInput
          label={t("emailLabel")}
          nativeInputProps={{
            id: "email",
            type: "email",
            autoCapitalize: "none",
            autoComplete: "email",
            autoCorrect: "off",
            required: true,
            value: identifier,
            onChange: e => setIdentifier(e.target.value),
            "aria-invalid": !!error,
          }}
          state={error ? "error" : "default"}
        />
      ) : (
        <UIInput
          label={t("usernameLabel")}
          nativeInputProps={{
            id: "username",
            type: "text",
            autoCapitalize: "none",
            autoCorrect: "off",
            required: true,
            pattern: "^[A-Za-z.]+$",
            title: t("usernameValidation"),
            value: identifier,
            onChange: e => setIdentifier(e.target.value),
            "aria-invalid": !!error,
          }}
          state={error ? "error" : "default"}
        />
      )}
      <UIButton type="submit" disabled={isPending}>
        {t("login")}
      </UIButton>
    </form>
  );
};
