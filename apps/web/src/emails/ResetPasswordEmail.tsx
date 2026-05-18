import { type UiTheme } from "@/ui/types";

import { getEmailKit } from "./themed";

interface ResetPasswordTranslations {
  body: string;
  button: string;
  expiry: string;
  footer: string;
  ignore: string;
  title: string;
}

interface ResetPasswordEmailProps {
  baseUrl: string;
  locale?: string;
  theme?: UiTheme;
  translations: ResetPasswordTranslations;
  url: string;
}

export const ResetPasswordEmail = ({
  baseUrl,
  locale,
  theme = "Default",
  translations,
  url,
}: ResetPasswordEmailProps) => {
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
        <td style={{ padding: "0 10px", fontSize: "12px", color: "#666666" }}>
          <p>{translations.expiry}</p>
          <p>{translations.ignore}</p>
        </td>
      </tr>
    </Layout>
  );
};
