"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type SubmitEvent, useState, useTransition } from "react";

import { PASSWORD_MIN_LENGTH } from "@/lib/utils/passwordConstants";
import { UIAlert, UIButton, UIInput } from "@/ui/bridge";

import { resetPasswordAction } from "./actions";

const ResetPasswordPage = () => {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <UIAlert variant="destructive" description={t("resetPasswordInvalidToken")} />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="text-primary underline hover:text-primary/80">
              {t("forgotPasswordLink")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password || !passwordConfirm) return;

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(t("passwordTooShort", { min: PASSWORD_MIN_LENGTH }));
      return;
    }

    if (password !== passwordConfirm) {
      setError(t("passwordsMismatch"));
      return;
    }

    setError(undefined);
    startTransition(async () => {
      const result = await resetPasswordAction(token, password);
      if (result.ok) {
        setSuccess(true);
      } else {
        setError(
          result.error === "INVALID_OR_EXPIRED_TOKEN" ? t("resetPasswordInvalidToken") : t("resetPasswordError"),
        );
      }
    });
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-2xl font-semibold">{t("resetPasswordTitle")}</h2>
          <UIAlert variant="default" description={t("resetPasswordSuccess")} />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary underline hover:text-primary/80">
              {t("signinLink")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-2xl font-semibold">{t("resetPasswordTitle")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <UIAlert variant="destructive" description={error} />}
          <UIInput
            label={t("passwordLabel")}
            nativeInputProps={{
              id: "password",
              type: "password",
              autoComplete: "new-password",
              required: true,
              minLength: PASSWORD_MIN_LENGTH,
              value: password,
              onChange: e => setPassword(e.target.value),
            }}
          />
          <UIInput
            label={t("passwordConfirmLabel")}
            nativeInputProps={{
              id: "passwordConfirm",
              type: "password",
              autoComplete: "new-password",
              required: true,
              value: passwordConfirm,
              onChange: e => setPasswordConfirm(e.target.value),
            }}
          />
          <UIButton type="submit" disabled={isPending} className="w-full">
            {t("resetPasswordSubmit")}
          </UIButton>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
