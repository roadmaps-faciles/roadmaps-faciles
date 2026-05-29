"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type SubmitEvent, useState, useTransition } from "react";

import { UIAlert, UIButton, UIInput } from "@/ui/bridge";

import { passwordLoginAction } from "./passwordActions";

export const PasswordLoginForm = () => {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(undefined);
    startTransition(async () => {
      const result = await passwordLoginAction(email.trim(), password, callbackUrl);
      if (result.ok) {
        // Hard navigation pour rafraîchir la session côté client. `redirectTo`
        // est validé côté server action (URL relative same-host, fallback "/").
        window.location.href = result.data.redirectTo;
      } else {
        setError(result.error === "EMAIL_NOT_VERIFIED" ? t("emailNotVerified") : t("invalidCredentials"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <UIAlert variant="destructive" description={error} />}
      <UIInput
        label={t("emailLabel")}
        nativeInputProps={{
          id: "email",
          type: "email",
          autoCapitalize: "none",
          autoComplete: "email",
          autoCorrect: "off",
          required: true,
          value: email,
          onChange: e => setEmail(e.target.value),
          "aria-invalid": !!error,
        }}
        state={error ? "error" : "default"}
      />
      <UIInput
        label={t("passwordLabel")}
        nativeInputProps={{
          id: "password",
          type: "password",
          autoComplete: "current-password",
          required: true,
          value: password,
          onChange: e => setPassword(e.target.value),
          "aria-invalid": !!error,
        }}
        state={error ? "error" : "default"}
      />
      <div className="flex items-center justify-between">
        <UIButton type="submit" disabled={isPending}>
          {t("signIn")}
        </UIButton>
        <Link href="/forgot-password" className="text-sm text-primary underline hover:text-primary/80">
          {t("forgotPasswordLink")}
        </Link>
      </div>
    </form>
  );
};
