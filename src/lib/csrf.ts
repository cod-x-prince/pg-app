/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for CSRF protection
 * Protects all state-changing operations (POST, PUT, DELETE, PATCH)
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf-token";
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Validate CSRF token from request
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Skip validation for safe methods
  if (SAFE_METHODS.includes(request.method)) {
    return true;
  }

  // Skip for API routes from same origin (Next.js forms)
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  
  // If no origin header, it's likely a same-origin request
  if (!origin && host) {
    return true;
  }

  // Get token from header and cookie
  const tokenFromHeader = request.headers.get(CSRF_HEADER);
  const tokenFromCookie = request.cookies.get(CSRF_COOKIE)?.value;

  // Both must exist and match
  if (!tokenFromHeader || !tokenFromCookie) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(tokenFromHeader),
    Buffer.from(tokenFromCookie)
  );
}

/**
 * Middleware to add CSRF token to response
 */
export function addCsrfToken(response: NextResponse): NextResponse {
  // Generate token if not exists
  if (!response.cookies.get(CSRF_COOKIE)) {
    const token = generateCsrfToken();
    
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false, // Must be accessible to JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Also add to response header for easy client access
    response.headers.set(CSRF_HEADER, token);
  }

  return response;
}

/**
 * API route wrapper for CSRF protection
 */
export function withCsrfProtection(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // Validate CSRF token for unsafe methods
    if (!SAFE_METHODS.includes(req.method)) {
      if (!validateCsrfToken(req)) {
        return NextResponse.json(
          { error: "Invalid CSRF token. Please refresh and try again." },
          { status: 403 }
        );
      }
    }

    // Call the actual handler
    const response = await handler(req);

    // Add CSRF token to response
    return addCsrfToken(response);
  };
}

/**
 * Client-side helper to get CSRF token
 * Use this in your React components to get the token for fetch requests
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  
  const match = document.cookie.match(new RegExp(`(^| )${CSRF_COOKIE}=([^;]+)`));
  return match?.[2] ?? null;
}
