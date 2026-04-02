import { DsfrButton, DsfrHeading, DsfrSpacer, DsfrText } from "./components";
import { DsfrEmailLayout } from "./gouv/DsfrEmailLayout";

interface VerifyEmailTranslations {
  body: string;
  button: string;
  expiry: string;
  footer: string;
  ignore: string;
  title: string;
}

interface VerifyEmailEmailProps {
  baseUrl: string;
  locale?: string;
  translations: VerifyEmailTranslations;
  url: string;
}

export const VerifyEmailEmail = ({ baseUrl, locale, translations, url }: VerifyEmailEmailProps) => (
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
      <DsfrText>{translations.body}</DsfrText>
    </tr>
    <DsfrSpacer height={4} />
    <tr>
      <td style={{ padding: "10px 10px 10px 10px" }}>
        <DsfrButton href={url}>{translations.button}</DsfrButton>
      </td>
    </tr>
    <DsfrSpacer height={16} />
    <tr>
      <td style={{ padding: "0 10px", fontSize: "12px", color: "#666666" }}>
        <p>{translations.expiry}</p>
        <p>{translations.ignore}</p>
      </td>
    </tr>
  </DsfrEmailLayout>
);
