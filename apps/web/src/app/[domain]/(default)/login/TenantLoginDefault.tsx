import Link from "next/link";
import { type ReactNode } from "react";

import { UISeparator } from "@/ui/bridge";

import { OAuthButtons } from "./OAuthButtons";

interface TenantLoginDefaultProps {
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

export const TenantLoginDefault = ({
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
}: TenantLoginDefaultProps) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
    <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <h2 className="text-2xl font-semibold leading-none tracking-tight">{title}</h2>

      {fromRoot && nonMemberBanner && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{nonMemberBanner.title}</p>
          <p className="mt-1 text-sm text-blue-600 dark:text-blue-300">{nonMemberBanner.description}</p>
          {bridgeSignupUrl && (
            <Link
              href={bridgeSignupUrl}
              className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {bridgeSignupLabel}
            </Link>
          )}
        </div>
      )}

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

      <UISeparator />
      <div className="space-y-2 text-center text-sm text-muted-foreground">
        {passwordlessUrl && passwordlessLink && (
          <p>
            <Link href={passwordlessUrl} className="text-primary underline hover:text-primary/80">
              {passwordlessLink}
            </Link>
          </p>
        )}
        {!fromRoot && bridgeUrl && (
          <p>
            {bridgePrompt}{" "}
            <Link href={bridgeUrl} className="text-primary underline hover:text-primary/80">
              {bridgeLink}
            </Link>
          </p>
        )}
      </div>

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
