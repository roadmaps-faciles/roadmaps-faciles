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
    const params = new URLSearchParams(window.location.search);
    if (params.get("bridge_signup") === "1") {
      form.set("isSignup", "1");
    }

    // `next` est posé par /api/auth-bridge pour préserver la destination d'origine
    // (puisqu'on force le path à /login pour faire tourner ce composant). On
    // accepte uniquement les URLs relatives same-host pour éviter open redirect.
    const nextRaw = params.get("next");
    const safeNext = nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

    void bridgeSignIn(form).then(result => {
      if ("ok" in result) {
        // Session cookie was set by signIn - navigate on current domain
        window.location.href = safeNext;
      } else {
        window.location.href = `/login?error=${result.error}`;
      }
    });
  }, [token]);

  return <p>{t("bridgeLoggingIn")}</p>;
};
