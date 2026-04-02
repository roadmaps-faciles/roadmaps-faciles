"use client";

import { useState } from "react";

type CopyButtonProps = {
  children: React.ReactNode;
  className?: string;
  value: string;
};

export const CopyButton = ({ children, className, value }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className={className} title={copied ? "Copié !" : `Copier ${value}`} type="button" onClick={handleCopy}>
      {copied ? "Copié !" : children}
    </button>
  );
};
