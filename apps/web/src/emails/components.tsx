import { type ReactNode } from "react";

const FONT_FAMILY = "'Marianne', Arial, Helvetica, sans-serif";

interface DsfrButtonProps {
  children: ReactNode;
  href: string;
}

export const DsfrButton = ({ children, href }: DsfrButtonProps) => (
  <table
    align="left"
    border={0}
    cellPadding={0}
    cellSpacing={0}
    role="presentation"
    style={{ borderCollapse: "initial" as const, border: "solid 1px #000091", backgroundColor: "#000091" }}
  >
    <tbody>
      <tr>
        <td
          align="center"
          className="darkmode-button-primary"
          style={{
            fontSize: "14px",
            lineHeight: "24px",
            fontFamily: FONT_FAMILY,
            height: "40px",
            padding: "0px 24px",
          }}
        >
          <a
            className="darkmode-button-color-primary"
            href={href}
            style={{ color: "#FFFFFF", textDecoration: "none" }}
            target="_blank"
          >
            <span style={{ fontFamily: `${FONT_FAMILY} !important` }}>{children}</span>
          </a>
        </td>
      </tr>
    </tbody>
  </table>
);

interface DsfrTextProps {
  children: ReactNode;
}

export const DsfrText = ({ children }: DsfrTextProps) => (
  <td
    align="left"
    className="darkmode-1"
    style={{
      fontSize: "14px",
      lineHeight: "21px",
      fontFamily: FONT_FAMILY,
      color: "#3A3A3A",
      padding: "10px 10px 10px 10px",
    }}
    valign="top"
  >
    {children}
  </td>
);

interface DsfrHeadingProps {
  children: ReactNode;
}

export const DsfrHeading = ({ children }: DsfrHeadingProps) => (
  <td
    align="left"
    className="darkmode"
    style={{
      fontSize: "24px",
      lineHeight: "32px",
      fontFamily: FONT_FAMILY,
      fontWeight: "bold",
      color: "#161616",
      padding: "20px 10px 20px 10px",
    }}
    valign="top"
  >
    {children}
  </td>
);

interface DsfrSpacerProps {
  height?: number;
}

export const DsfrSpacer = ({ height = 16 }: DsfrSpacerProps) => (
  <tr>
    <td
      height={height}
      style={{
        height: `${height}px`,
        lineHeight: `${height}px`,
        fontSize: `${height}px`,
      }}
    >
      &nbsp;
    </td>
  </tr>
);
