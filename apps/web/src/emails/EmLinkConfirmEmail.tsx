import { type UiTheme } from "@/ui/types";

import { getEmailKit } from "./themed";

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
  theme?: UiTheme;
  translations: EmLinkConfirmEmailTranslations;
}

export const EmLinkConfirmEmail = ({
  baseUrl,
  confirmUrl,
  locale,
  theme = "Default",
  translations,
}: EmLinkConfirmEmailProps) => {
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
        <Text>{translations.greeting}</Text>
      </tr>
      <tr>
        <Text>{translations.body}</Text>
      </tr>
      <Spacer height={4} />
      <tr>
        <td style={{ padding: "10px 10px 10px 10px" }}>
          <Button href={confirmUrl}>{translations.button}</Button>
        </td>
      </tr>
      <Spacer height={16} />
      <tr>
        <Text>
          <em>{translations.expiry}</em>
        </Text>
      </tr>
      <tr>
        <Text>{translations.closing}</Text>
      </tr>
      <Spacer height={12} />
    </Layout>
  );
};
