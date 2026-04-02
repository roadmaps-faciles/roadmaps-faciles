"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";

import { PASSWORD_MIN_LENGTH } from "@/lib/utils/passwordConstants";
import { UIAlert, UIButton, UIInput } from "@/ui/bridge";

import { tenantSignupAction } from "./actions";

export const TenantSignupForm = () => {
  const t = useTranslations("auth");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !passwordConfirm) return;

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
      const result = await tenantSignupAction({ name: name.trim(), email: email.trim(), password });
      if (result.ok) {
        setSuccess(true);
      } else {
        const errorMap: Record<string, string> = {
          ALREADY_MEMBER: t("emailAlreadyExists"),
          REGISTRATION_DISABLED: t("registrationDisabled"),
          EMAIL_DOMAIN_NOT_ALLOWED: t("emailDomainNotAllowed"),
        };
        setError(errorMap[result.error] ?? result.error);
      }
    });
  };

  if (success) {
    return (
      <div className="space-y-4">
        <UIAlert variant="default" description={t("signupSuccess")} />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary underline hover:text-primary/80">
            {t("signinLink")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <UIAlert variant="destructive" description={error} />}
      <UIInput
        label={t("nameLabel")}
        nativeInputProps={{
          id: "name",
          type: "text",
          autoComplete: "name",
          required: true,
          value: name,
          onChange: e => setName(e.target.value),
        }}
      />
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
        }}
      />
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
        {t("signUp")}
      </UIButton>
      <p className="text-center text-sm text-muted-foreground">
        {t("signInPrompt")}{" "}
        <Link href="/login" className="font-medium text-primary underline hover:text-primary/80">
          {t("signinLink")}
        </Link>
      </p>
    </form>
  );
};
