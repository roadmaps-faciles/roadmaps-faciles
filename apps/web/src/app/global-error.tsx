"use client";

import "./tailwind-entry.css";
import "./globals.scss";

import { Button } from "@roadmaps-faciles/ui";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, ServerCrash } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { isDatabaseUnavailableError } from "@/utils/dbError";
import { clientParseError } from "@/utils/error";

const isDev = process.env.NODE_ENV === "development";

interface GlobalErrorProps {
  error: { digest?: string } & Error;
  reset: () => void;
}

export default function GlobalError({ error: _error, reset }: GlobalErrorProps) {
  const error = clientParseError(_error);
  const isDbDown = isDatabaseUnavailableError(error);

  useEffect(() => {
    Sentry.captureException(_error);
  }, [_error]);

  return (
    <html lang="fr" data-ui-theme="Default">
      <body>
        <div className="mx-auto max-w-4xl px-4">
          {isDbDown ? (
            <div className="my-16 flex flex-col items-center gap-8 md:my-24 md:flex-row md:gap-12">
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Service indisponible</h1>
                <p className="text-sm text-muted-foreground">Erreur 503</p>
                <p className="text-lg text-muted-foreground">Le service est temporairement indisponible.</p>
                <p className="text-sm text-muted-foreground">
                  Notre base de données est injoignable pour le moment. Réessayez dans quelques instants.
                </p>
                {isDev && <DevErrorDetails error={error} />}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => reset()}>
                    Réessayer
                  </Button>
                  <Button asChild>
                    <Link href="/">Page d&apos;accueil</Link>
                  </Button>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-center">
                <div className="flex size-32 items-center justify-center rounded-full bg-orange-100 md:size-40 dark:bg-orange-950">
                  <ServerCrash className="size-16 text-orange-600 md:size-20 dark:text-orange-400" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          ) : (
            <div className="my-16 flex flex-col items-center gap-8 md:my-24 md:flex-row md:gap-12">
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Erreur technique</h1>
                <p className="text-lg text-muted-foreground">{error.name}</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                {isDev && <DevErrorDetails error={error} />}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => reset()}>
                    Réessayer
                  </Button>
                  <Button asChild>
                    <Link href="/">Page d&apos;accueil</Link>
                  </Button>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-center">
                <div className="flex size-32 items-center justify-center rounded-full bg-red-100 md:size-40 dark:bg-red-950">
                  <AlertTriangle className="size-16 text-red-600 md:size-20 dark:text-red-400" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}

function DevErrorDetails({ error }: { error: Error }) {
  return (
    <details className="mt-2 rounded-md border border-orange-200 bg-orange-50 p-3 text-xs dark:border-orange-900 dark:bg-orange-950/30">
      <summary className="cursor-pointer font-mono font-semibold">
        [dev] {error.name}: {error.message}
      </summary>
      {error.stack && (
        <pre className="mt-2 max-h-96 overflow-auto font-mono text-[11px] whitespace-pre-wrap">{error.stack}</pre>
      )}
    </details>
  );
}
