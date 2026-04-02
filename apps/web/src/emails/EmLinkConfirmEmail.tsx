import { DsfrButton, DsfrHeading, DsfrSpacer, DsfrText } from "./components";
import { DsfrEmailLayout } from "./gouv/DsfrEmailLayout";

interface EmLinkConfirmEmailTranslations {
  body: string;
  button: string;
  closing: string;
  expiry: string;
  footer: string;
  greeting: string;
  title: string;
}

interface EmLinkConfirmEmailProps {
  baseUrl: string;
  confirmUrl: string;
  locale?: string;
  translations: EmLinkConfirmEmailTranslations;
}

export const EmLinkConfirmEmail = ({ baseUrl, confirmUrl, locale, translations }: EmLinkConfirmEmailProps) => (
  <DsfrEmailLayout
    baseUrl={baseUrl}
    footerText={translations.footer}
    locale={locale}
    previewText={translations.title}
    serviceName="Roadmaps Faciles"
  >
    <tr>
      <DsfrHeading>{translations.title}</DsfrHeading>
    </tr>
    <tr>
      <DsfrText>{translations.greeting}</DsfrText>
    </tr>
    <tr>
      <DsfrText>{translations.body}</DsfrText>
    </tr>
    <DsfrSpacer height={4} />
    <tr>
      <td style={{ padding: "10px 10px 10px 10px" }}>
        <DsfrButton href={confirmUrl}>{translations.button}</DsfrButton>
      </td>
    </tr>
    <DsfrSpacer height={16} />
    <tr>
      <DsfrText>
        <em>{translations.expiry}</em>
      </DsfrText>
    </tr>
    <tr>
      <DsfrText>{translations.closing}</DsfrText>
    </tr>
    <DsfrSpacer height={12} />
  </DsfrEmailLayout>
);
