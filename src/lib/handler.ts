import { NextResponse } from "next/server";

type Handler = (...args: any[]) => Promise<NextResponse>;

/**
 * Wraps any API route handler with try/catch.
 * Returns clean 500 JSON — never exposes stack traces to clients.
 * Sentry captures errors automatically via instrumentation.ts.
 */
export function withHandler(fn: Handler): Handler {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error("[API Error]", err);
      return NextResponse.json(
        { error: "Internal server error. Please try again." },
        { status: 500 },
      );
    }
  };
}
