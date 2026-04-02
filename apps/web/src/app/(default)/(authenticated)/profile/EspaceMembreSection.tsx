"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { UIAlert, UIButton, UIInput } from "@/ui/bridge";

import { requestEmLink, unlinkEspaceMembre } from "./actions";

interface EspaceMembreSectionProps {
  isBetaGouvMember: boolean;
  username: null | string;
}

export const EspaceMembreSection = ({ isBetaGouvMember, username }: EspaceMembreSectionProps) => {
  const t = useTranslations("profile");
  const [emLogin, setEmLogin] = useState("");
  const [pending, setPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const handleRequestLink = async () => {
    if (!emLogin.trim()) return;

    setPending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result = await requestEmLink(emLogin.trim());
    if (!result.ok) {
      setErrorMessage(result.error);
    } else {
      setSuccessMessage(t("emVerificationSent", { email: result.data.emEmail }));
    }
    setPending(false);
  };

  const handleUnlink = async () => {
    if (!confirm(t("emUnlinkConfirm"))) return;

    setPending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const result = await unlinkEspaceMembre();
    if (!result.ok) {
      setErrorMessage(result.error);
    } else {
      setSuccessMessage(t("emUnlinked"));
    }
    setPending(false);
  };

  if (isBetaGouvMember && username) {
    return (
      <div>
        <UIAlert variant="default" description={t("emLinked", { username })} className="mb-4" />
        <ClientAnimate>
          {successMessage && <UIAlert variant="success" description={successMessage} className="mb-4" />}
          {errorMessage && <UIAlert variant="destructive" description={errorMessage} className="mb-4" />}
        </ClientAnimate>
        <UIButton variant="ghost" size="sm" disabled={pending} onClick={() => void handleUnlink()}>
          {t("emUnlink")}
        </UIButton>
      </div>
    );
  }

  return (
    <div>
      <UIAlert variant="default" description={t("emLinkDescription")} className="mb-4" />
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <UIInput
            label={t("emLoginLabel")}
            hintText={t("emLoginHint")}
            nativeInputProps={{
              id: "em-login",
              value: emLogin,
              onChange: e => setEmLogin(e.target.value),
              placeholder: "prenom.nom",
              disabled: pending,
            }}
          />
        </div>
        <UIButton
          variant="outline"
          size="sm"
          className="mb-[1.75rem]"
          disabled={pending || !emLogin.trim()}
          onClick={() => void handleRequestLink()}
        >
          {t("emLink")}
        </UIButton>
      </div>
      <ClientAnimate>
        {successMessage && <UIAlert variant="success" description={successMessage} className="mt-4" />}
        {errorMessage && <UIAlert variant="destructive" description={errorMessage} className="mt-4" />}
      </ClientAnimate>
    </div>
  );
};
