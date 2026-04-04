import { type ReactNode } from "react";

import { type UiTheme } from "@/ui/types";

import { DsfrButton, DsfrHeading, DsfrSpacer, DsfrText } from "./components";
import { DefaultButton, DefaultHeading, DefaultSpacer, DefaultText } from "./default/components";
import { DefaultEmailLayout } from "./default/DefaultEmailLayout";
import { DsfrEmailLayout } from "./gouv/DsfrEmailLayout";

interface EmailLayoutProps {
  baseUrl: string;
  children: ReactNode;
  footerText: string;
  locale?: string;
  previewText?: string;
  serviceName: string;
}

interface EmailButtonProps {
  children: ReactNode;
  href: string;
}

interface EmailTextProps {
  children: ReactNode;
}

interface EmailHeadingProps {
  children: ReactNode;
}

interface EmailSpacerProps {
  height?: number;
}

export function getEmailKit(theme: UiTheme) {
  if (theme === "Dsfr") {
    return {
      Layout: DsfrEmailLayout as React.FC<EmailLayoutProps>,
      Button: DsfrButton as React.FC<EmailButtonProps>,
      Heading: DsfrHeading as React.FC<EmailHeadingProps>,
      Spacer: DsfrSpacer as React.FC<EmailSpacerProps>,
      Text: DsfrText as React.FC<EmailTextProps>,
    };
  }
  return {
    Layout: DefaultEmailLayout as React.FC<EmailLayoutProps>,
    Button: DefaultButton as React.FC<EmailButtonProps>,
    Heading: DefaultHeading as React.FC<EmailHeadingProps>,
    Spacer: DefaultSpacer as React.FC<EmailSpacerProps>,
    Text: DefaultText as React.FC<EmailTextProps>,
  };
}
