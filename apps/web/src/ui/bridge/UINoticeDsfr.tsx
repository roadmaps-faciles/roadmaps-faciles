"use client";

import DsfrNotice from "@codegouvfr/react-dsfr/Notice";

import { type UINoticeProps } from "./UINotice";

export const UINoticeDsfr = ({
  severity = "info",
  title,
  description,
  link,
  closable,
  onClose,
  className,
}: UINoticeProps) => {
  const linkProp = link
    ? {
        linkProps: { href: link.href, target: link.target ?? "_self" },
        text: link.text,
      }
    : undefined;

  if (closable) {
    return (
      <DsfrNotice
        severity={severity}
        title={title as NonNullable<React.ReactNode>}
        description={description}
        link={linkProp}
        isClosable
        onClose={onClose}
        className={className}
      />
    );
  }

  return (
    <DsfrNotice
      severity={severity}
      title={title as NonNullable<React.ReactNode>}
      description={description}
      link={linkProp}
      className={className}
    />
  );
};
