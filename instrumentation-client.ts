import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enabled: process.env.NODE_ENV === "production",
  integrations: [Sentry.browserTracingIntegration()],
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ChunkLoadError",
    /^Loading chunk \d+ failed/,
    "Network request failed",
  ],
});

// Required for Sentry to instrument client-side navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
