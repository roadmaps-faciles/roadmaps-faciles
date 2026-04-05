"use server";

import { config } from "@/config";
import { getEmailTranslations, interpolate } from "@/emails/getEmailTranslations";
import {
  renderEmLinkConfirmEmail,
  renderInvitationEmail,
  renderMagicLinkEmail,
  renderResetPasswordEmail,
  renderVerifyEmailEmail,
} from "@/emails/renderEmails";
import { sendEmail } from "@/lib/mailer";
import { type UiTheme } from "@/ui/types";
import { assertAdmin } from "@/utils/auth";
import { type ServerActionResponse } from "@/utils/next";

export type EmailTemplate = "emLinkConfirm" | "invitation" | "magicLink" | "resetPassword" | "verifyEmail";
export type ColorMode = "auto" | "dark" | "light";

const DARK_STYLES_DSFR = `
  :root { color-scheme: dark !important; }
  body { background: #161616 !important; }
  .hide-black { display: none !important; }
  .hide-white { display: block !important; }
  .darkmode { background-color: #161616 !important; color: #F5F5F5 !important; background: none !important; border-color: #2A2A2A !important; }
  .darkmode-1 { background-color: #161616 !important; color: #CECECE !important; background: none !important; }
  .darkmode-3 { background-color: #1E1E1E !important; color: #F5F5F5 !important; border-color: #2A2A2A !important; }
  a[href] { color: #8585F6 !important; }
  a.darkmode-button-color-primary[href] { color: #000091 !important; }
  .darkmode-button-primary { background-color: #8585F6 !important; color: #000091 !important; border: solid 1px #8585F6 !important; }
`;

const DARK_STYLES_DEFAULT = `
  :root { color-scheme: dark !important; }
  body { background: #161616 !important; }
  .hide-black { display: none !important; }
  .hide-white { display: block !important; }
  .darkmode { background-color: #161616 !important; color: #F5F5F5 !important; background: none !important; border-color: #2A2A2A !important; }
  .darkmode-1 { background-color: #161616 !important; color: #CECECE !important; background: none !important; }
  .darkmode-3 { background-color: #1E1E1E !important; color: #F5F5F5 !important; border-color: #2A2A2A !important; }
  a[href] { color: #7BA3F0 !important; }
  a.darkmode-button-color-primary[href] { color: #F5F5F5 !important; }
  .darkmode-button-primary { background-color: #516DAC !important; border: solid 1px #516DAC !important; border-radius: 6px !important; }
`;

function forceColorMode(html: string, mode: ColorMode, theme: UiTheme): string {
  if (mode === "auto") return html;

  if (mode === "dark") {
    const styles = theme === "Dsfr" ? DARK_STYLES_DSFR : DARK_STYLES_DEFAULT;
    return html.replace("</head>", `<style>${styles}</style></head>`);
  }

  return html
    .replace(/@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "")
    .replace(/\[data-ogsc\][^{]*\{[^}]*\}/g, "");
}

async function renderTemplate(template: EmailTemplate, theme: UiTheme): Promise<{ html: string; subject: string }> {
  const baseUrl = config.host;
  const [tFooter] = await Promise.all([getEmailTranslations("fr", "emails", ["footer"])]);

  switch (template) {
    case "magicLink": {
      const t = await getEmailTranslations("fr", "emails.magicLink", [
        "subject",
        "title",
        "body",
        "button",
        "expiry",
        "ignore",
      ]);
      return {
        subject: `[TEST] ${t.subject}`,
        html: await renderMagicLinkEmail({
          baseUrl,
          theme,
          translations: { ...t, footer: tFooter.footer },
          url: `${baseUrl}/login?test=true`,
        }),
      };
    }
    case "invitation": {
      const t = await getEmailTranslations("fr", "emails.invitation", [
        "subjectUser",
        "title",
        "body",
        "button",
        "ignore",
      ]);
      return {
        subject: `[TEST] ${t.subjectUser}`,
        html: await renderInvitationEmail({
          baseUrl,
          invitationLink: `${baseUrl}/login?invitation=test`,
          theme,
          translations: {
            title: t.title,
            body: interpolate(t.body, { roleText: "" }),
            button: t.button,
            ignore: t.ignore,
            footer: tFooter.footer,
          },
        }),
      };
    }
    case "verifyEmail":
      return {
        subject: "[TEST] Vérifiez votre adresse email",
        html: await renderVerifyEmailEmail({
          baseUrl,
          theme,
          url: `${baseUrl}/api/verify-email?token=test`,
          translations: {
            title: "Vérifiez votre adresse email",
            body: "Cliquez sur le bouton ci-dessous pour activer votre compte.",
            button: "Vérifier mon email",
            expiry: "Ce lien expire dans 24 heures.",
            ignore: "Si vous n'avez pas créé de compte, ignorez cet email.",
            footer: tFooter.footer,
          },
        }),
      };
    case "resetPassword":
      return {
        subject: "[TEST] Réinitialiser votre mot de passe",
        html: await renderResetPasswordEmail({
          baseUrl,
          theme,
          url: `${baseUrl}/reset-password?token=test`,
          translations: {
            title: "Réinitialiser votre mot de passe",
            body: "Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.",
            button: "Réinitialiser mon mot de passe",
            expiry: "Ce lien expire dans 1 heure.",
            ignore: "Si vous n'avez pas demandé de réinitialisation, ignorez cet email.",
            footer: tFooter.footer,
          },
        }),
      };
    case "emLinkConfirm": {
      const t = await getEmailTranslations("fr", "emails.emLinkConfirm", [
        "subject",
        "greeting",
        "body",
        "button",
        "expiry",
        "closing",
      ]);
      return {
        subject: `[TEST] ${t.subject}`,
        html: await renderEmLinkConfirmEmail({
          baseUrl,
          confirmUrl: `${baseUrl}/api/confirm-em-link?token=test`,
          theme,
          translations: {
            title: t.subject,
            greeting: t.greeting,
            body: interpolate(t.body, { username: "test-user" }),
            button: t.button,
            expiry: t.expiry,
            closing: t.closing,
            footer: tFooter.footer,
          },
        }),
      };
    }
  }
}

export const previewEmail = async (data: {
  colorMode: ColorMode;
  template: EmailTemplate;
  theme: UiTheme;
}): Promise<ServerActionResponse<string>> => {
  await assertAdmin();
  const { html } = await renderTemplate(data.template, data.theme);
  return { ok: true, data: forceColorMode(html, data.colorMode, data.theme) };
};

export const sendTestEmail = async (data: {
  colorMode: ColorMode;
  recipient: string;
  template: EmailTemplate;
  theme: UiTheme;
}): Promise<ServerActionResponse> => {
  await assertAdmin();
  const { template, theme, colorMode, recipient } = data;

  if (!recipient.trim()) return { ok: false, error: "No recipient" };

  const { html, subject } = await renderTemplate(template, theme);
  const finalHtml = forceColorMode(html, colorMode, theme);
  await sendEmail({ to: recipient.trim(), subject, html: finalHtml, text: subject });

  return { ok: true };
};
