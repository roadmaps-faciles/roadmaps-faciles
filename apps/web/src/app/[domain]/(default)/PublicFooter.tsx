import Footer, { type FooterProps } from "@codegouvfr/react-dsfr/Footer";
import { getTranslations } from "next-intl/server";

import { config } from "@/config";

export interface PublicFooterProps {
  id: FooterProps["id"];
}

export const PublicFooter = async ({ id }: PublicFooterProps) => {
  const t = await getTranslations("footer");

  return (
    <Footer
      id={id}
      accessibility="non compliant"
      operatorLogo={config.brand.operator.enable ? config.brand.operator.logo : undefined}
      license={
        <>
          {t.rich("license", {
            a: chunks => (
              <a href={`${config.repositoryUrl}/main/LICENSE`} target="_blank" rel="noreferrer">
                {chunks}
              </a>
            ),
          })}
        </>
      }
    />
  );
};
