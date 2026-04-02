"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { bridgeSignIn } from "./bridgeSignIn";

export interface BridgeAutoLoginProps {
  token: string;
}

export const BridgeAutoLogin = ({ token }: BridgeAutoLoginProps) => {
  const t = useTranslations("auth");
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    const form = new FormData();
    form.set("token", token);

    void bridgeSignIn(form).then(result => {
      if ("ok" in result) {
        // Session cookie was set by signIn — navigate on current domain
        window.location.href = "/";
      } else {
        window.location.href = `/login?error=${result.error}`;
      }
    });
  }, [token]);

  return <p>{t("bridgeLoggingIn")}</p>;
};
