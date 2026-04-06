/* eslint-disable @next/next/no-img-element -- email templates use <img>, not next/image */
import { Body, Head, Html, Preview } from "@react-email/components";
import { type ReactNode } from "react";

import { DefaultSpacer } from "./components";

const FONT_FAMILY = "'Inter', 'Segoe UI', Arial, Helvetica, sans-serif";
const PRIMARY_COLOR = "#163C90";

const darkModeStyles = `
:root {
  color-scheme: light dark;
  supported-color-schemes: light dark;
}
.hide-white { display: none !important; }
.hide-black { display: block !important; }
@media (prefers-color-scheme: dark) {
  body { background: #161616 !important; }
  .hide-black { display: none !important; }
  .hide-white { display: block !important; }
  .darkmode { background-color: #161616 !important; color: #F5F5F5 !important; background: none !important; border-color: #2A2A2A !important; }
  .darkmode-1 { background-color: #161616 !important; color: #CECECE !important; background: none !important; }
  .darkmode-3 { background-color: #1E1E1E !important; color: #F5F5F5 !important; border-color: #2A2A2A !important; }
  a[href] { color: #7BA3F0 !important; }
  a.darkmode-button-color-primary[href] { color: #F5F5F5 !important; }
  .darkmode-button-primary { background-color: #516DAC !important; border: solid 1px #516DAC !important; border-radius: 6px !important; }
}
[data-ogsc] .hide-black { display: none !important; }
[data-ogsc] .hide-white { display: block !important; }
[data-ogsc] .darkmode { background-color: #161616 !important; color: #F5F5F5 !important; border-color: #2A2A2A !important; }
[data-ogsc] .darkmode-1 { background-color: #161616 !important; color: #CECECE !important; }
[data-ogsc] .darkmode-3 { background-color: #1E1E1E !important; color: #F5F5F5 !important; border-color: #2A2A2A !important; }
[data-ogsc] a[href] { color: #7BA3F0 !important; }
[data-ogsc] .darkmode-button-primary { background-color: #516DAC !important; border: solid 1px #516DAC !important; }
@media only screen and (max-width: 600px) {
  .wlkm-mw { width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
  .wlkm-cl { width: 90% !important; margin: 0 auto; }
}
`;

interface DefaultEmailLayoutProps {
  baseUrl: string;
  children: ReactNode;
  footerText: string;
  locale?: string;
  previewText?: string;
  serviceName: string;
}

export const DefaultEmailLayout = ({
  baseUrl,
  children,
  footerText,
  locale = "fr",
  previewText,
  serviceName,
}: DefaultEmailLayoutProps) => (
  <Html lang={locale}>
    <Head>
      <meta content="text/html; charset=UTF-8" httpEquiv="Content-Type" />
      <meta content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" name="viewport" />
      <style dangerouslySetInnerHTML={{ __html: darkModeStyles }} />
    </Head>
    {previewText && <Preview>{previewText}</Preview>}
    <Body
      style={{
        width: "100%",
        backgroundColor: "#F5F5F5",
        margin: 0,
        padding: 0,
        WebkitTextSizeAdjust: "none",
        fontFamily: FONT_FAMILY,
      }}
    >
      <table
        border={0}
        cellPadding={0}
        cellSpacing={0}
        className="darkmode"
        role="presentation"
        style={{ minWidth: "100%", width: "100%" }}
        width="100%"
      >
        <tbody>
          <tr>
            <td align="center">
              {/* Single bordered container: header + content + footer */}
              <table
                align="center"
                border={0}
                cellPadding={0}
                cellSpacing={0}
                className="wlkm-mw darkmode-3"
                role="presentation"
                style={{
                  margin: "0 auto",
                  borderCollapse: "collapse",
                  width: "600px",
                  border: "1px #e5e5e5 solid",
                }}
                width={600}
              >
                <tbody>
                  <DefaultSpacer height={12} />

                  {/* Header: Logo + service name */}
                  <tr>
                    <td align="center">
                      <table
                        align="center"
                        border={0}
                        cellPadding={0}
                        cellSpacing={0}
                        className="wlkm-cl darkmode"
                        role="presentation"
                        style={{ margin: "0 auto", borderCollapse: "collapse", width: "496px" }}
                        width={496}
                      >
                        <tbody>
                          <tr>
                            <td style={{ width: "40px" }} valign="middle" width={40}>
                              <img
                                alt="Roadmaps Faciles"
                                height={32}
                                src={`${baseUrl}/img/roadmaps-faciles.png`}
                                style={{ display: "block", border: 0, outline: "none", borderRadius: "4px" }}
                                width={32}
                              />
                            </td>
                            <td
                              align="left"
                              className="darkmode"
                              style={{
                                fontSize: "16px",
                                lineHeight: "20px",
                                fontFamily: FONT_FAMILY,
                                fontWeight: "bold",
                                color: PRIMARY_COLOR,
                                paddingLeft: "8px",
                              }}
                              valign="middle"
                            >
                              {serviceName}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <DefaultSpacer height={12} />

                  {/* Header separator */}
                  <tr>
                    <td style={{ borderTop: "1px #e5e5e5 solid", fontSize: "1px", lineHeight: "1px" }}>&nbsp;</td>
                  </tr>

                  {/* Content */}
                  <tr>
                    <td align="center">
                      <table
                        align="center"
                        border={0}
                        cellPadding={0}
                        cellSpacing={0}
                        className="wlkm-cl darkmode"
                        role="presentation"
                        style={{ margin: "0 auto", borderCollapse: "collapse", width: "496px" }}
                        width={496}
                      >
                        <tbody>{children}</tbody>
                      </table>
                    </td>
                  </tr>

                  {/* Footer separator */}
                  <tr>
                    <td style={{ borderTop: "1px #e5e5e5 solid", fontSize: "1px", lineHeight: "1px" }}>&nbsp;</td>
                  </tr>

                  <DefaultSpacer height={12} />

                  {/* Footer */}
                  <tr>
                    <td align="center">
                      <table
                        align="center"
                        border={0}
                        cellPadding={0}
                        cellSpacing={0}
                        className="wlkm-cl darkmode"
                        role="presentation"
                        style={{ margin: "0 auto", borderCollapse: "collapse", width: "496px" }}
                        width={496}
                      >
                        <tbody>
                          <tr>
                            <td
                              align="center"
                              className="darkmode-1"
                              style={{
                                fontSize: "12px",
                                lineHeight: "20px",
                                fontFamily: FONT_FAMILY,
                                color: "#6b6b6b",
                              }}
                              valign="middle"
                            >
                              {footerText}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <DefaultSpacer height={12} />
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </Body>
  </Html>
);
