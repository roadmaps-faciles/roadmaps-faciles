import Link from "next/link";
import { type ReactNode } from "react";

import { UISeparator } from "@/ui/bridge";

import { OAuthButtons } from "./OAuthButtons";

interface TenantLoginDefaultProps {
  children: ReactNode;
  oauthPrompt: string;
  passwordlessLink?: string;
  passwordlessUrl?: string;
  providerNames: string[];
  signupLink?: string;
  signupUrl?: string;
  title: string;
}

export const TenantLoginDefault = ({
  children,
  oauthPrompt,
  passwordlessLink,
  passwordlessUrl,
  providerNames,
  signupLink,
  signupUrl,
  title,
}: TenantLoginDefaultProps) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
    <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="text-2xl font-semibold leading-none tracking-tight">{title}</h2>

      {children}

      {providerNames.length > 0 && (
        <>
          <UISeparator />
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{oauthPrompt}</p>
            <OAuthButtons providers={providerNames} />
          </div>
        </>
      )}

      {passwordlessUrl && passwordlessLink && (
        <>
          <UISeparator />
          <div className="text-center text-sm text-muted-foreground">
            <Link href={passwordlessUrl} className="text-primary underline hover:text-primary/80">
              {passwordlessLink}
            </Link>
          </div>
        </>
      )}

      {signupUrl && signupLink && (
        <>
          <UISeparator />
          <p className="text-center text-sm text-muted-foreground">
            <Link href={signupUrl} className="font-medium text-primary underline hover:text-primary/80">
              {signupLink}
            </Link>
          </p>
        </>
      )}
    </div>
  </div>
);
