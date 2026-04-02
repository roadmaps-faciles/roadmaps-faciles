import { DsfrButton, DsfrHeading, DsfrSpacer, DsfrText } from "./components";
import { DsfrEmailLayout } from "./gouv/DsfrEmailLayout";

interface InvitationEmailTranslations {
  body: string;
  button: string;
  footer: string;
  ignore: string;
  title: string;
}

interface InvitationEmailProps {
  baseUrl: string;
  invitationLink: string;
  locale?: string;
  translations: InvitationEmailTranslations;
}

export const InvitationEmail = ({ baseUrl, invitationLink, locale, translations }: InvitationEmailProps) => (
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
        <DsfrButton href={invitationLink}>{translations.button}</DsfrButton>
      </td>
    </tr>
    <DsfrSpacer height={16} />
    <tr>
      <DsfrText>
        <em>{translations.ignore}</em>
      </DsfrText>
    </tr>
    <DsfrSpacer height={12} />
  </DsfrEmailLayout>
);
