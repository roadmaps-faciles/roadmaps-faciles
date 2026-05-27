/**
 * Check that all email templates stay under the Gmail clipping threshold (102 Ko).
 * Runs via tsx - not vitest (Rolldown can't parse JSX in email templates).
 *
 * Usage: pnpm check:email-sizes
 */
// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- script needs React global for email template JSX (runs via tsx, not bundler)
import React, { createElement } from "react";

// Email templates use JSX classic transform in tsx - needs React on globalThis
(globalThis as Record<string, unknown>).React = React;

import { render } from "@react-email/render";

import { EmLinkConfirmEmail } from "../src/emails/EmLinkConfirmEmail";
import { InvitationEmail } from "../src/emails/InvitationEmail";
import { MagicLinkEmail } from "../src/emails/MagicLinkEmail";
import { ResetPasswordEmail } from "../src/emails/ResetPasswordEmail";
import { VerifyEmailEmail } from "../src/emails/VerifyEmailEmail";

const MAX_SIZE_BYTES = 80 * 1024; // 80 Ko - safe margin below Gmail's 102 Ko

const base = {
  baseUrl: "http://localhost:3000",
  translations: {
    title: "Test title for size measurement",
    body: "This is a body text that simulates a real email content with enough words to be realistic.",
    button: "Click here to continue",
    expiry: "This link expires in 24 hours.",
    footer: "© 2026 Roadmaps Faciles - All rights reserved.",
    ignore: "If you didn't request this email, you can safely ignore it.",
  },
};

const templates: Array<[string, React.ReactElement]> = [
  [
    "MagicLink Default",
    createElement(MagicLinkEmail, {
      ...base,
      url: "http://localhost:3000/login?token=abc123",
      theme: "Default" as const,
    }),
  ],
  [
    "MagicLink Dsfr",
    createElement(MagicLinkEmail, { ...base, url: "http://localhost:3000/login?token=abc123", theme: "Dsfr" as const }),
  ],
  [
    "Invitation Default",
    createElement(InvitationEmail, {
      ...base,
      invitationLink: "http://localhost:3000/login?invitation=abc123",
      theme: "Default" as const,
    }),
  ],
  [
    "Invitation Dsfr",
    createElement(InvitationEmail, {
      ...base,
      invitationLink: "http://localhost:3000/login?invitation=abc123",
      theme: "Dsfr" as const,
    }),
  ],
  [
    "VerifyEmail Default",
    createElement(VerifyEmailEmail, {
      ...base,
      url: "http://localhost:3000/verify?token=abc123",
      theme: "Default" as const,
    }),
  ],
  [
    "VerifyEmail Dsfr",
    createElement(VerifyEmailEmail, {
      ...base,
      url: "http://localhost:3000/verify?token=abc123",
      theme: "Dsfr" as const,
    }),
  ],
  [
    "ResetPwd Default",
    createElement(ResetPasswordEmail, {
      ...base,
      url: "http://localhost:3000/reset?token=abc123",
      theme: "Default" as const,
    }),
  ],
  [
    "ResetPwd Dsfr",
    createElement(ResetPasswordEmail, {
      ...base,
      url: "http://localhost:3000/reset?token=abc123",
      theme: "Dsfr" as const,
    }),
  ],
  [
    "EmLink Default",
    createElement(EmLinkConfirmEmail, {
      ...base,
      confirmUrl: "http://localhost:3000/confirm?token=abc123",
      theme: "Default" as const,
      translations: { ...base.translations, greeting: "Bonjour,", closing: "Cordialement," },
    }),
  ],
  [
    "EmLink Dsfr",
    createElement(EmLinkConfirmEmail, {
      ...base,
      confirmUrl: "http://localhost:3000/confirm?token=abc123",
      theme: "Dsfr" as const,
      translations: { ...base.translations, greeting: "Bonjour,", closing: "Cordialement," },
    }),
  ],
];

async function main() {
  console.log("Email size check (threshold: %d Ko)\n", MAX_SIZE_BYTES / 1024);
  console.log("  Template".padEnd(28), "Size".padStart(8), " Status");
  console.log("  " + "-".repeat(42));

  let failed = false;

  for (const [name, el] of templates) {
    const html = await render(el);
    const bytes = Buffer.byteLength(html, "utf8");
    const kb = (bytes / 1024).toFixed(1);
    const over = bytes > MAX_SIZE_BYTES;
    if (over) failed = true;
    console.log("  " + name.padEnd(26), `${kb} Ko`.padStart(8), over ? " ⚠️  OVER" : " ✓");
  }

  console.log();
  if (failed) {
    console.error("FAIL: one or more emails exceed %d Ko", MAX_SIZE_BYTES / 1024);
    process.exit(1);
  }
  console.log("All emails under %d Ko ✓", MAX_SIZE_BYTES / 1024);
}

void main();
