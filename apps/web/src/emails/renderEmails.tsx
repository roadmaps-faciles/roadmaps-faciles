import "server-only";
import { render } from "@react-email/render";

import { EmLinkConfirmEmail } from "./EmLinkConfirmEmail";
import { InvitationEmail } from "./InvitationEmail";
import { MagicLinkEmail } from "./MagicLinkEmail";
import { ResetPasswordEmail } from "./ResetPasswordEmail";
import { VerifyEmailEmail } from "./VerifyEmailEmail";

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
  translations: MagicLinkEmailTranslations;
  url: string;
}) => render(<MagicLinkEmail {...props} />);

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
  translations: InvitationEmailTranslations;
}) => render(<InvitationEmail {...props} />);

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
  translations: EmLinkConfirmEmailTranslations;
}) => render(<EmLinkConfirmEmail {...props} />);

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
  translations: VerifyEmailTranslations;
  url: string;
}) => render(<VerifyEmailEmail {...props} />);

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
  translations: ResetPasswordTranslations;
  url: string;
}) => render(<ResetPasswordEmail {...props} />);
