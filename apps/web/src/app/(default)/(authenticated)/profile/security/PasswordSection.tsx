"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState, useTransition } from "react";

import { PASSWORD_MIN_LENGTH } from "@/lib/utils/passwordConstants";
import { UIAlert, UIButton, UIInput } from "@/ui/bridge";

import { changePassword, setPassword } from "./passwordActions";

export const PasswordSection = ({ hasPassword }: { hasPassword: boolean }) => {
  const t = useTranslations("profile.password");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(t("tooShort", { min: PASSWORD_MIN_LENGTH }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("mismatch"));
      return;
    }

    setError(undefined);
    setSuccess(undefined);
    startTransition(async () => {
      const result = hasPassword ? await changePassword(currentPassword, newPassword) : await setPassword(newPassword);

      if (result.ok) {
        setSuccess(t("success"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(result.error === "WRONG_PASSWORD" ? t("wrongPassword") : result.error);
      }
    });
  };

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <h3 className="text-lg font-semibold">{hasPassword ? t("changeTitle") : t("setTitle")}</h3>
      <p className="text-sm text-muted-foreground">{hasPassword ? t("changeDescription") : t("setDescription")}</p>

      {success && <UIAlert variant="default" description={success} />}
      {error && <UIAlert variant="destructive" description={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {hasPassword && (
          <UIInput
            label={t("currentPassword")}
            nativeInputProps={{
              id: "currentPassword",
              type: "password",
              autoComplete: "current-password",
              required: true,
              value: currentPassword,
              onChange: e => setCurrentPassword(e.target.value),
            }}
          />
        )}
        <UIInput
          label={t("newPassword")}
          nativeInputProps={{
            id: "newPassword",
            type: "password",
            autoComplete: "new-password",
            required: true,
            minLength: PASSWORD_MIN_LENGTH,
            value: newPassword,
            onChange: e => setNewPassword(e.target.value),
          }}
        />
        <UIInput
          label={t("confirmPassword")}
          nativeInputProps={{
            id: "confirmPassword",
            type: "password",
            autoComplete: "new-password",
            required: true,
            value: confirmPassword,
            onChange: e => setConfirmPassword(e.target.value),
          }}
        />
        <UIButton type="submit" disabled={isPending}>
          {hasPassword ? t("changeButton") : t("setButton")}
        </UIButton>
      </form>
    </div>
  );
};
