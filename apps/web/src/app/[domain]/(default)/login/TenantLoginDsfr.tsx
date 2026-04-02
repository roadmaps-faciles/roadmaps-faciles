import { type ReactNode } from "react";

import style from "@/app/(default)/login/login.module.scss";
import { Box, Container, Grid, GridCol } from "@/gouv/dsfr";
import { DsfrPage } from "@/gouv/dsfr/layout/DsfrPage";

import { OAuthButtons } from "./OAuthButtons";

interface TenantLoginDsfrProps {
  bridgeLink: string;
  bridgePrompt: string;
  bridgeSignupLabel?: string;
  bridgeSignupUrl?: string;
  bridgeUrl: string;
  children: ReactNode;
  fromRoot?: boolean;
  nonMemberBanner?: { description: string; title: string };
  oauthPrompt: string;
  passwordlessLink?: string;
  passwordlessUrl?: string;
  providerNames: string[];
  signupLink?: string;
  signupUrl?: string;
  title: string;
}

export const TenantLoginDsfr = ({
  bridgeUrl,
  bridgePrompt,
  bridgeLink,
  bridgeSignupUrl,
  bridgeSignupLabel,
  children,
  fromRoot,
  nonMemberBanner,
  oauthPrompt,
  passwordlessLink,
  passwordlessUrl,
  providerNames,
  signupLink,
  signupUrl,
  title,
}: TenantLoginDsfrProps) => (
  <DsfrPage>
    <Container ptmd="14v" mbmd="14v" fluid>
      <Grid haveGutters align="center">
        <GridCol md={8} lg={6}>
          <Container pxmd="0" py="10v" mymd="14v" className={style.login}>
            <Grid haveGutters align="center">
              <GridCol md={9} lg={8}>
                <h1>{title}</h1>

                {fromRoot && nonMemberBanner && (
                  <div className="fr-callout fr-callout--blue-ecume fr-mb-4w">
                    <p className="fr-callout__title">{nonMemberBanner.title}</p>
                    <p className="fr-callout__text">{nonMemberBanner.description}</p>
                    {bridgeSignupUrl && (
                      <a href={bridgeSignupUrl} className="fr-btn fr-mt-2w">
                        {bridgeSignupLabel}
                      </a>
                    )}
                  </div>
                )}

                <Box>{children}</Box>
                {providerNames.length > 0 && (
                  <>
                    <hr className="fr-mt-4w fr-pb-2w" />
                    <p className="fr-text--sm">{oauthPrompt}</p>
                    <OAuthButtons providers={providerNames} />
                  </>
                )}
                <hr className="fr-mt-4w fr-pb-2w" />
                {passwordlessUrl && passwordlessLink && (
                  <p className="fr-text--sm">
                    <a href={passwordlessUrl}>{passwordlessLink}</a>
                  </p>
                )}
                {!fromRoot && bridgeUrl && (
                  <p className="fr-text--sm">
                    {bridgePrompt} <a href={bridgeUrl}>{bridgeLink}</a>
                  </p>
                )}
                {signupUrl && signupLink && (
                  <>
                    <hr className="fr-mt-4w fr-pb-2w" />
                    <p className="fr-text--sm">
                      <a href={signupUrl} className="fr-link">
                        {signupLink}
                      </a>
                    </p>
                  </>
                )}
              </GridCol>
            </Grid>
          </Container>
        </GridCol>
      </Grid>
    </Container>
  </DsfrPage>
);
