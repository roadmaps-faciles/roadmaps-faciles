import { type UiTheme } from "@/ui/types";

import { getEmailKit } from "./themed";

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
  theme?: UiTheme;
  translations: MagicLinkEmailTranslations;
  url: string;
}

export const MagicLinkEmail = ({ baseUrl, locale, theme = "Default", translations, url }: MagicLinkEmailProps) => {
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
          <Button href={url}>{translations.button}</Button>
        </td>
      </tr>
      <Spacer height={16} />
      <tr>
        <Text>
          <em>{translations.expiry}</em>
        </Text>
      </tr>
      <tr>
        <Text>
          <em>{translations.ignore}</em>
        </Text>
      </tr>
      <Spacer height={12} />
    </Layout>
  );
};
