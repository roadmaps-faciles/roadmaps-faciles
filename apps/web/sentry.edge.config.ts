import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const appEnv = process.env.APP_ENV || "dev";
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "dev";
const tracesSampleRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1");

const defaultSampleRates: Record<string, number> = {
  prod: 0.1,
  staging: 0.5,
  dev: 1.0,
  review: 1.0,
};

const envDefault = defaultSampleRates[appEnv] ?? defaultSampleRates.dev;

Sentry.init({
  dsn,
  enabled: !!dsn,
  environment: appEnv,
  release: appVersion,

  tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : envDefault,

  initialScope: {
    tags: {
      app_version: appVersion,
    },
  },
});
