"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@roadmaps-faciles/ui";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { ClientAnimate } from "@/components/utils/ClientAnimate";
import { type User } from "@/prisma/client";
import { UserRole, UserStatus } from "@/prisma/enums";

import { updateUser } from "./actions";

const ASSIGNABLE_ROLES = [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN] as const;
const ASSIGNABLE_STATUSES = [UserStatus.ACTIVE, UserStatus.BLOCKED] as const;

const emptyToNull = z
  .string()
  .transform(v => (v.trim() === "" ? null : v))
  .nullable();

const formSchema = z.object({
  name: emptyToNull,
  email: z.email(),
  username: emptyToNull,
  role: z.enum(ASSIGNABLE_ROLES),
  status: z.enum(ASSIGNABLE_STATUSES),
});

type FormType = z.infer<typeof formSchema>;

interface UserEditFormProps {
  user: User;
}

export const UserEditForm = ({ user }: UserEditFormProps) => {
  const t = useTranslations("adminUsers");
  const tc = useTranslations("common");
  const tr = useTranslations("roles");
  const ts = useTranslations("memberStatus");
  const locale = useLocale();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale],
  );
  const [saveError, setSaveError] = useState<null | string>(null);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<FormType>({
    mode: "onChange",
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role as FormType["role"],
      status: user.status as FormType["status"],
    },
  });

  const onSubmit = async (data: FormType) => {
    setSaveError(null);
    setPending(true);
    setSuccess(false);

    const result = await updateUser({ userId: user.id, data });
    if (!result.ok) {
      setSaveError(result.error);
    } else {
      reset(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
    setPending(false);
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">{t("informationSection")}</h2>
        <dl className="space-y-1">
          <div>
            <dt className="inline font-bold">{t("idLabel")} :</dt> <dd className="inline">{user.id}</dd>
          </div>
          <div>
            <dt className="inline font-bold">{t("createdAtLabel")} :</dt>{" "}
            <dd className="inline">{dateFormatter.format(new Date(user.createdAt))}</dd>
          </div>
          <div>
            <dt className="inline font-bold">{t("lastSignInLabel")} :</dt>{" "}
            <dd className="inline">{user.lastSignInAt ? dateFormatter.format(new Date(user.lastSignInAt)) : "-"}</dd>
          </div>
          <div>
            <dt className="inline font-bold">{t("signInCountLabel")} :</dt>{" "}
            <dd className="inline">{user.signInCount}</dd>
          </div>
        </dl>
      </div>

      <form noValidate onSubmit={e => void handleSubmit(onSubmit)(e)}>
        <h2 className="mb-4 text-xl font-semibold">{t("editSection")}</h2>

        <fieldset className="mb-8 space-y-6 border-0 p-0">
          <legend className="mb-4">
            <h3 className="text-lg font-medium">{t("identityLegend")}</h3>
          </legend>

          <div className="space-y-2">
            <Label htmlFor="name">{t("nameLabel")}</Label>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t("usernameLabel")}</Label>
            <Input id="username" aria-invalid={!!errors.username} {...register("username")} />
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>
        </fieldset>

        <fieldset className="mb-8 space-y-6 border-0 p-0">
          <legend className="mb-4">
            <h3 className="text-lg font-medium">{t("roleAndStatusLegend")}</h3>
          </legend>

          <div className="space-y-2">
            <Label htmlFor="edit-role">{t("roleLabel")}</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="edit-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map(role => (
                      <SelectItem key={role} value={role}>
                        {tr(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">{t("statusLabel")}</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="edit-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {ts(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </fieldset>

        <ClientAnimate>
          {saveError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>{t("saveError")}</AlertTitle>
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertTitle>{t("saveSuccess")}</AlertTitle>
            </Alert>
          )}
        </ClientAnimate>

        <Button type="submit" disabled={pending || !isDirty}>
          {tc("save")}
        </Button>
      </form>
    </>
  );
};
