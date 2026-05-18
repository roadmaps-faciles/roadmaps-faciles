"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { TechnicalErrorDisplay } from "@/components/Error/TechnicalErrorDisplay";
import { clientParseError } from "@/utils/error";

export default function TenantScopeError({ error: _error, reset }: { error: Error; reset: () => void }) {
  const error = clientParseError(_error);

  useEffect(() => {
    Sentry.captureException(_error);
  }, [_error]);

  return <TechnicalErrorDisplay error={error} reset={reset} />;
}
