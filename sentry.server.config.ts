import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Capture all server-side errors in production
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",

  // Add user context to all server errors
  beforeSend(event) {
    // Never send passwords or tokens to Sentry
    if (event.request?.data) {
      const data = event.request.data as any
      if (data.password) data.password = "[REDACTED]"
      if (data.token) data.token = "[REDACTED]"
      if (data.turnstileToken) data.turnstileToken = "[REDACTED]"
    }
    return event
  },
})
