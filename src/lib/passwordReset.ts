/**
 * Password Reset Token Management
 * Secure token generation, storage, and validation
 */

import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_HOURS = 1; // Password reset tokens expire in 1 hour
const TOKEN_LENGTH = 32; // 32 bytes = 256 bits

/**
 * Generate a secure password reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("base64url");
}

/**
 * Hash token for database storage (prevents token leakage if DB compromised)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create and store a password reset token
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generateResetToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email: email.toLowerCase() },
  });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      email: email.toLowerCase(),
      token: hashedToken,
      expiresAt,
    },
  });

  return token; // Return unhashed token to send via email
}

/**
 * Verify a password reset token
 */
export async function verifyResetToken(
  token: string,
): Promise<{ valid: boolean; email?: string; error?: string }> {
  const hashedToken = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!resetToken) {
    return { valid: false, error: "Invalid or expired token" };
  }

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { token: hashedToken },
    });
    return { valid: false, error: "Token has expired" };
  }

  return { valid: true, email: resetToken.email };
}

/**
 * Invalidate a reset token after use
 */
export async function invalidateResetToken(token: string): Promise<void> {
  const hashedToken = hashToken(token);
  await prisma.passwordResetToken
    .delete({
      where: { token: hashedToken },
    })
    .catch(() => {
      // Token might already be deleted, ignore error
    });
}

/**
 * Clean up expired tokens (run periodically via cron)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}
