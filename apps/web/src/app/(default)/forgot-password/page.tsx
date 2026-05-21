"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { type SubmitEvent, useState, useTransition } from "react";

import { UIAlert, UIButton, UIInput } from "@/ui/bridge";

import { forgotPasswordAction } from "./actions";

const ForgotPasswordPage = () => {
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      await forgotPasswordAction(email.trim());
      setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-2xl font-semibold">{t("forgotPasswordTitle")}</h2>
          <UIAlert variant="default" description={t("forgotPasswordSent")} />
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary underline hover:text-primary/80">
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
        <h2 className="text-2xl font-semibold">{t("forgotPasswordTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("forgotPasswordDescription")}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <UIInput
            label={t("emailLabel")}
            nativeInputProps={{
              id: "email",
              type: "email",
              autoComplete: "email",
              required: true,
              value: email,
              onChange: e => setEmail(e.target.value),
            }}
          />
          <UIButton type="submit" disabled={isPending} className="w-full">
            {t("forgotPasswordSubmit")}
          </UIButton>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline hover:text-primary/80">
            {t("signinLink")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
