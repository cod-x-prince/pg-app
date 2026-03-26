/**
 * Type Guards and Utilities for Type-Safe Session Handling
 * Replaces unsafe `as any` casts with proper type validation
 */

import type { SessionUser } from "@/types";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Type guard to check if a value is a valid SessionUser
 */
export function isSessionUser(user: unknown): user is SessionUser {
  if (!user || typeof user !== "object") return false;

  const u = user as Record<string, unknown>;

  return (
    typeof u.id === "string" &&
    typeof u.email === "string" &&
    typeof u.name === "string" &&
    (u.role === "TENANT" || u.role === "OWNER" || u.role === "BROKER" || u.role === "ADMIN") &&
    typeof u.isApproved === "boolean"
  );
}

/**
 * Safely extract user data from NextAuth user object
 */
export function toSessionUser(user: User): SessionUser | null {
  try {
    // Cast to unknown first to avoid type mismatch
    const u = user as unknown as Record<string, unknown>;

    if (!u.id || !u.email || !u.name) return null;

    return {
      id: String(u.id),
      email: String(u.email),
      name: String(u.name),
      role: (u.role as SessionUser["role"]) ?? "TENANT",
      isApproved: Boolean(u.isApproved),
      image: u.image ? String(u.image) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Safely extract user data from JWT token
 */
export function getUserFromToken(token: JWT): Pick<SessionUser, "id" | "role" | "isApproved"> | null {
  try {
    if (!token.sub) return null;

    return {
      id: token.sub,
      role: (token.role as SessionUser["role"]) ?? "TENANT",
      isApproved: Boolean(token.isApproved),
    };
  } catch {
    return null;
  }
}

/**
 * Type-safe session extraction with validation
 */
export function extractSessionUser(session: { user?: unknown } | null): SessionUser | null {
  if (!session?.user) return null;

  if (isSessionUser(session.user)) {
    return session.user;
  }

  return null;
}
