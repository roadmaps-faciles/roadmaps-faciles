import { type UiTheme } from "@/ui/types";

import { getEmailKit } from "./themed";

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
  theme?: UiTheme;
  translations: InvitationEmailTranslations;
}

export const InvitationEmail = ({
  baseUrl,
  invitationLink,
  locale,
  theme = "Default",
  translations,
}: InvitationEmailProps) => {
  const { Button, Heading, Layout, Spacer, Text } = getEmailKit(theme);

  return (
    <Layout
      baseUrl={baseUrl}
      footerText={translations.footer}
      locale={locale}
      previewText={translations.title}
      serviceName="Roadmaps Faciles"
    >
      <tr>
        <Heading>{translations.title}</Heading>
      </tr>
      <tr>
        <Text>{translations.body}</Text>
      </tr>
      <Spacer height={4} />
      <tr>
        <td style={{ padding: "10px 10px 10px 10px" }}>
          <Button href={invitationLink}>{translations.button}</Button>
        </td>
      </tr>
      <Spacer height={16} />
      <tr>
        <Text>
          <em>{translations.ignore}</em>
        </Text>
      </tr>
      <Spacer height={12} />
    </Layout>
  );
};
