"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { UIAlert, UIButton, UIInput } from "@/ui/bridge";
import { type ServerActionResponse } from "@/utils/next";

interface DeleteAccountSectionProps {
  deleteAccount: () => Promise<ServerActionResponse>;
}

export const DeleteAccountSection = ({ deleteAccount }: DeleteAccountSectionProps) => {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const confirmationWord = t("deleteConfirmationWord");

  const handleDelete = async () => {
    setPending(true);
    setErrorMessage(null);

    const result = await deleteAccount();
    if (!result.ok) {
      setErrorMessage(result.error);
      setPending(false);
    } else {
      void signOut({ redirectTo: "/" });
    }
  };

  if (!showConfirm) {
    return (
      <div>
        <UIAlert variant="warning" description={t("deleteWarning")} className="mb-4" />
        <UIButton variant="ghost" size="sm" onClick={() => setShowConfirm(true)}>
          {t("deleteAccount")}
        </UIButton>
      </div>
    );
  }

  return (
    <div>
      <UIAlert
        variant="destructive"
        description={t("deleteConfirmPrompt", { text: confirmationWord })}
        className="mb-4"
      />
      <div className="mb-4">
        <UIInput
          label={t("confirmation")}
          nativeInputProps={{
            id: "confirm-delete",
            value: confirmInput,
            onChange: e => setConfirmInput(e.target.value),
            placeholder: confirmationWord,
            autoComplete: "off",
            disabled: pending,
          }}
        />
      </div>
      {errorMessage && <UIAlert variant="destructive" description={errorMessage} className="mb-4" />}
      <div className="flex gap-4">
        <UIButton size="sm" disabled={pending || confirmInput !== confirmationWord} onClick={() => void handleDelete()}>
          {t("confirmDelete")}
        </UIButton>
        <UIButton
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => {
            setShowConfirm(false);
            setConfirmInput("");
            setErrorMessage(null);
          }}
        >
          {tc("cancel")}
        </UIButton>
      </div>
    </div>
  );
};
