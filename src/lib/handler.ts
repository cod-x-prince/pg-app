import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { logger } from "@/lib/logger";

type Handler = (...args: any[]) => Promise<NextResponse>;

interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

/**
 * Categorize errors and return appropriate status codes
 */
function categorizeError(err: unknown): { status: number; response: ErrorResponse } {
  // Zod validation errors
  if (err && typeof err === "object" && "issues" in err) {
    const zodError = err as ZodError;
    return {
      status: 400,
      response: {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: zodError.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    };
  }

  // Prisma errors
  if (err && typeof err === "object" && "code" in err) {
    const prismaErr = err as { code: string; meta?: any };
    
    if (prismaErr.code === "P2002") {
      return {
        status: 409,
        response: {
          error: "A record with this value already exists",
          code: "DUPLICATE_ERROR",
        },
      };
    }
    
    if (prismaErr.code === "P2025") {
      return {
        status: 404,
        response: {
          error: "Record not found",
          code: "NOT_FOUND",
        },
      };
    }
  }

  // Default server error
  return {
    status: 500,
    response: {
      error: "Internal server error. Please try again.",
      code: "INTERNAL_ERROR",
    },
  };
}

/**
 * Wraps any API route handler with try/catch and proper error categorization.
 * Returns appropriate status codes instead of always returning 500.
 * Sentry captures errors automatically via instrumentation.ts.
 */
export function withHandler(fn: Handler): Handler {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      logger.error("[API Error]", err);
      
      const { status, response } = categorizeError(err);
      
      // Don't expose sensitive error details in production
      if (process.env.NODE_ENV === "production") {
        delete response.details;
      }
      
      return NextResponse.json(response, { status });
    }
  };
}
