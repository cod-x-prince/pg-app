import { NextResponse } from "next/server"

type Handler = (...args: any[]) => Promise<NextResponse>

/**
 * Wraps any API route handler with a try/catch.
 * Returns a clean 500 JSON on any unhandled error.
 * Usage: export const GET = withHandler(async (req) => { ... })
 */
export function withHandler(fn: Handler): Handler {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (err) {
      console.error("[API Error]", err)
      return NextResponse.json(
        { error: "Internal server error. Please try again." },
        { status: 500 }
      )
    }
  }
}
