import { NextResponse } from "next/server";

type Handler = (...args: any[]) => Promise<NextResponse>;

/**
 * Wraps any API route handler with:
 * - try/catch for unhandled errors
 * - Sentry error reporting (lazy import — safe at build time)
 * - Clean 500 JSON response (never exposes stack traces)
 */
export function withHandler(fn: Handler): Handler {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error("[API Error]", err);

      // Lazy import Sentry — avoids build-time crash when SENTRY_DSN is missing
      try {
        const Sentry = await import("@sentry/nextjs");
        Sentry.captureException(err, {
          extra: {
            args: args.map((a: any) => ({
              url: a?.url,
              method: a?.method,
            })),
          },
        });
      } catch {
        // Sentry not available — silently continue
      }

      return NextResponse.json(
        { error: "Internal server error. Please try again." },
        { status: 500 },
      );
    }
  };
}
