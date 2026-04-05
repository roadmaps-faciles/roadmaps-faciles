import "server-only";
import { render } from "@react-email/render";
import { createElement } from "react";

import { type UiTheme } from "@/ui/types";

import { EmLinkConfirmEmail } from "./EmLinkConfirmEmail";
import { InvitationEmail } from "./InvitationEmail";
import { MagicLinkEmail } from "./MagicLinkEmail";
import { ResetPasswordEmail } from "./ResetPasswordEmail";
import { VerifyEmailEmail } from "./VerifyEmailEmail";

async function renderMinified(element: React.ReactElement): Promise<string> {
  const html = await render(element);
  return html.replace(/\n\s+/g, "\n").replace(/>\s+</g, "><");
}

type MagicLinkEmailTranslations = {
  body: string;
  button: string;
  expiry: string;
  footer: string;
  ignore: string;
  title: string;
};

export const renderMagicLinkEmail = (props: {
  baseUrl: string;
  locale?: string;
  theme?: UiTheme;
  translations: MagicLinkEmailTranslations;
  url: string;
}) => renderMinified(createElement(MagicLinkEmail, props));

type InvitationEmailTranslations = {
  body: string;
  button: string;
  footer: string;
  ignore: string;
  title: string;
};

export const renderInvitationEmail = (props: {
  baseUrl: string;
  invitationLink: string;
  locale?: string;
  theme?: UiTheme;
  translations: InvitationEmailTranslations;
}) => renderMinified(createElement(InvitationEmail, props));

type EmLinkConfirmEmailTranslations = {
  body: string;
  button: string;
  closing: string;
  expiry: string;
  footer: string;
  greeting: string;
  title: string;
};

export const renderEmLinkConfirmEmail = (props: {
  baseUrl: string;
  confirmUrl: string;
  locale?: string;
  theme?: UiTheme;
  translations: EmLinkConfirmEmailTranslations;
}) => renderMinified(createElement(EmLinkConfirmEmail, props));

type VerifyEmailTranslations = {
  body: string;
  button: string;
  expiry: string;
  footer: string;
  ignore: string;
  title: string;
};

export const renderVerifyEmailEmail = (props: {
  baseUrl: string;
  locale?: string;
  theme?: UiTheme;
  translations: VerifyEmailTranslations;
  url: string;
}) => renderMinified(createElement(VerifyEmailEmail, props));

type ResetPasswordTranslations = {
  body: string;
  button: string;
  expiry: string;
  footer: string;
  ignore: string;
  title: string;
};

export const renderResetPasswordEmail = (props: {
  baseUrl: string;
  locale?: string;
  theme?: UiTheme;
  translations: ResetPasswordTranslations;
  url: string;
}) => renderMinified(createElement(ResetPasswordEmail, props));
