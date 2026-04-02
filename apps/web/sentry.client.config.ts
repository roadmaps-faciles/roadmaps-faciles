import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || "dev";
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
const tracesSampleRate = parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.1");

// Environment-aware defaults
const defaultSampleRates: Record<string, { traces: number }> = {
  prod: { traces: 0.1 },
  staging: { traces: 0.5 },
  dev: { traces: 1.0 },
  review: { traces: 1.0 },
};

const envDefaults = defaultSampleRates[appEnv] || defaultSampleRates.dev;

// PostHog cross-integration: attach PostHog session/distinct ID to Sentry events
function attachPostHogContext(event: Sentry.ErrorEvent): null | Sentry.ErrorEvent {
  if (process.env.NEXT_PUBLIC_TRACKING_PROVIDER !== "posthog" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return event;
  }

  try {
    // posthog-js singleton — may not be initialized yet, safe to call
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
    const posthog = require("posthog-js").default as import("posthog-js").PostHog;
    const sessionId = posthog.get_session_id?.();
    const distinctId = posthog.get_distinct_id?.();

    if (sessionId) {
      event.tags = { ...event.tags, posthog_session_id: sessionId };
    }
    if (distinctId) {
      event.tags = { ...event.tags, posthog_distinct_id: distinctId };
    }
  } catch {
    // PostHog not loaded yet — fine, skip
  }

  return event;
}

// Filter out noise (browser extensions, ResizeObserver, network errors, etc.)
function filterNoise(event: Sentry.ErrorEvent): null | Sentry.ErrorEvent {
  const message = event.exception?.values?.[0]?.value ?? "";

  const noisePatterns = [
    // Browser noise
    /ResizeObserver loop/i,
    /ResizeObserver loop completed with undelivered notifications/i,
    // Extensions
    /chrome-extension:\/\//,
    /moz-extension:\/\//,
    /safari-extension:\/\//,
    // Network errors that aren't actionable
    /Failed to fetch/,
    /Load failed/,
    /NetworkError/,
    /AbortError/,
    // CORS (usually 3rd party)
    /blocked by CORS/i,
  ];

  if (noisePatterns.some(pattern => pattern.test(message))) {
    return null;
  }

  return event;
}

Sentry.init({
  dsn,
  enabled: !!dsn,
  environment: appEnv,
  release: appVersion,

  tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : envDefaults.traces,

  // No session replay
  replaysOnErrorSampleRate: 0,
  replaysSessionSampleRate: 0,

  beforeSend(event) {
    const filtered = filterNoise(event);
    if (!filtered) return null;
    return attachPostHogContext(filtered);
  },

  initialScope: {
    tags: {
      app_version: appVersion,
    },
  },
});
