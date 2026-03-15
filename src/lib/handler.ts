import { NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"

type Handler = (...args: any[]) => Promise<NextResponse>

/**
 * Wraps any API route handler with:
 * - try/catch for unhandled errors
 * - Sentry error reporting with request context
 * - Clean 500 JSON response (never exposes stack traces)
 */
export function withHandler(fn: Handler): Handler {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (err) {
      // Report to Sentry with full context
      Sentry.captureException(err, {
        extra: {
          args: args.map((a: any) => ({
            url: a?.url,
            method: a?.method,
          })),
        },
      })

      console.error("[API Error]", err)

      return NextResponse.json(
        { error: "Internal server error. Please try again." },
        { status: 500 }
      )
    }
  }
}
