"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { UIAlert, UIButton, UIInput, UISeparator, UISwitch } from "@/ui/bridge";

import { deleteAccount, switchToEmEmail, updateProfile } from "./actions";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { EspaceMembreSection } from "./EspaceMembreSection";

const emptyToNull = z
  .string()
  .transform(v => (v.trim() === "" ? null : v))
  .nullable();

interface FormType {
  email?: string;
  name: null | string;
  notificationsEnabled: boolean;
}

export interface ProfileFormUser {
  email: string;
  emEmail: null | string;
  isBetaGouvMember: boolean;
  name: null | string;
  notificationsEnabled: boolean;
  username: null | string;
}

interface ProfileFormProps {
  user: ProfileFormUser;
  variant: "root" | "tenant";
}

export const ProfileForm = ({ user, variant }: ProfileFormProps) => {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const tv = useTranslations("validation");
  const [saveError, setSaveError] = useState<null | string>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [switchPending, setSwitchPending] = useState(false);

  const formSchema = z.object({
    email: z.string().email(tv("invalidEmail")).optional(),
    name: emptyToNull,
    notificationsEnabled: z.boolean(),
  });

  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<FormType>({
    mode: "onChange",
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      email: user.email,
      name: user.name,
      notificationsEnabled: user.notificationsEnabled,
    },
  });

  const notificationsEnabled = useWatch({ control, name: "notificationsEnabled" });

  const onSubmit = async (data: FormType) => {
    setSaveError(null);
    setPending(true);
    setSuccess(false);

    const result = await updateProfile(
      variant === "tenant" ? data : { name: data.name, notificationsEnabled: data.notificationsEnabled },
    );
    if (!result.ok) {
      setSaveError(result.error);
    } else {
      reset(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
    setPending(false);
  };

  const handleSwitchToEmEmail = async () => {
    setSwitchPending(true);
    const result = await switchToEmEmail();
    if (!result.ok) {
      setSaveError(result.error);
    }
    setSwitchPending(false);
  };

  const emailsAreSame = user.emEmail != null && user.email === user.emEmail;
  const showEmEmailHint = variant === "tenant" && user.isBetaGouvMember && user.emEmail != null;

  const getEmailHintText = () => {
    if (variant === "root") return t("managedByEm");
    if (!showEmEmailHint) return undefined;
    if (emailsAreSame) return t("sameAsEmEmail");
    return undefined;
  };

  return (
    <form noValidate onSubmit={e => void handleSubmit(onSubmit)(e)}>
      <fieldset className="mb-8 space-y-6 border-0 p-0">
        <legend className="mb-4">
          <h3 className="text-lg font-semibold">{t("identity")}</h3>
        </legend>

        {variant === "tenant" && (
          <UIInput
            label={t("fullName")}
            nativeInputProps={{
              id: "name",
              "aria-invalid": !!errors.name,
              ...register("name"),
            }}
            state={errors.name ? "error" : "default"}
            stateRelatedMessage={errors.name?.message}
          />
        )}

        {variant === "tenant" ? (
          <div className="space-y-2">
            <UIInput
              label={t("emailAddress")}
              nativeInputProps={{
                id: "email",
                type: "email",
                "aria-invalid": !!errors.email,
                ...register("email"),
              }}
              state={errors.email ? "error" : "default"}
              stateRelatedMessage={errors.email?.message}
            />
            {getEmailHintText() && <p className="text-sm text-muted-foreground">{getEmailHintText()}</p>}
            {showEmEmailHint && !emailsAreSame && (
              <p className="text-xs text-muted-foreground">
                {t("emEmailPrefix")} <strong>{user.emEmail}</strong>{" "}
                <UIButton
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  disabled={switchPending}
                  onClick={() => void handleSwitchToEmEmail()}
                >
                  {t("useThisEmail")}
                </UIButton>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <UIInput
              label={t("emailAddress")}
              nativeInputProps={{
                id: "email",
                type: "email",
                disabled: true,
                value: user.email,
              }}
            />
            <p className="text-sm text-muted-foreground">{t("managedByEm")}</p>
          </div>
        )}
      </fieldset>

      <fieldset className="mb-8 space-y-4 border-0 p-0">
        <legend className="mb-4">
          <h3 className="text-lg font-semibold">{t("notifications")}</h3>
        </legend>
        <UISwitch
          label={t("emailNotifications")}
          checked={notificationsEnabled}
          onCheckedChangeAction={checked => setValue("notificationsEnabled", checked, { shouldDirty: true })}
        />
      </fieldset>

      {variant === "tenant" && (
        <fieldset className="mb-8 space-y-4 border-0 p-0">
          <legend className="mb-4">
            <h3 className="text-lg font-semibold">{t("espaceMembre")}</h3>
          </legend>
          <EspaceMembreSection isBetaGouvMember={user.isBetaGouvMember} username={user.username} />
        </fieldset>
      )}

      <ClientAnimate>
        {saveError && (
          <UIAlert variant="destructive" title={te("saveError")} description={saveError} className="mb-4" />
        )}
        {success && <UIAlert variant="success" title={tc("success")} className="mb-4" />}
      </ClientAnimate>

      <UIButton type="submit" disabled={pending || !isDirty}>
        {t("saveChanges")}
      </UIButton>

      <UISeparator className="my-8" />

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="mb-4">
          <h3 className="text-lg font-semibold">{t("dangerZone")}</h3>
        </legend>
        <DeleteAccountSection deleteAccount={deleteAccount} />
      </fieldset>
    </form>
  );
};
