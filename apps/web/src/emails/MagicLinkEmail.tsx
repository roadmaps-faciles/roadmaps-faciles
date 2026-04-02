import { DsfrButton, DsfrHeading, DsfrSpacer, DsfrText } from "./components";
import { DsfrEmailLayout } from "./gouv/DsfrEmailLayout";

interface MagicLinkEmailTranslations {
  body: string;
  button: string;
  expiry: string;
  footer: string;
  ignore: string;
  title: string;
}

interface MagicLinkEmailProps {
  baseUrl: string;
  locale?: string;
  translations: MagicLinkEmailTranslations;
  url: string;
}

export const MagicLinkEmail = ({ baseUrl, locale, translations, url }: MagicLinkEmailProps) => (
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
      <DsfrText>
        <em>{translations.expiry}</em>
      </DsfrText>
    </tr>
    <tr>
      <DsfrText>
        <em>{translations.ignore}</em>
      </DsfrText>
    </tr>
    <DsfrSpacer height={12} />
  </DsfrEmailLayout>
);
