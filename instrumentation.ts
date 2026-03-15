export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === "production",
      beforeSend(event: any) {
        if (event.request?.data) {
          const data = event.request.data as any;
          if (data.password) data.password = "[REDACTED]";
          if (data.token) data.token = "[REDACTED]";
          if (data.turnstileToken) data.turnstileToken = "[REDACTED]";
        }
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const { init } = await import("@sentry/nextjs");
    init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === "production",
    });
  }
}
